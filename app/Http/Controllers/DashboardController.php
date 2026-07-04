<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\Resident;
use App\Models\Payment;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getSummary()
    {
        $totalResidents = Resident::count();
        $occupiedHouses = House::where('status', 'dihuni')->count();
        $unoccupiedHouses = House::where('status', 'tidak_dihuni')->count();
        $totalHouses = House::count();
        $occupancyRate = $totalHouses > 0 ? round(($occupiedHouses / $totalHouses) * 100) : 0;

        $totalInflow = Payment::where('status', 'lunas')->sum('amount');
        $totalOutflow = Expense::sum('amount');
        $currentBalance = $totalInflow - $totalOutflow;

        // Current month inflow and outflow
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $monthInflow = Payment::where('status', 'lunas')
            ->whereMonth('payment_date', $currentMonth)
            ->whereYear('payment_date', $currentYear)
            ->sum('amount');

        $monthOutflow = Expense::whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        // Unpaid list for current month
        $unpaidList = [];
        $occupiedHousesList = House::with(['activeResidentRelation.resident', 'payments' => function ($query) use ($currentMonth, $currentYear) {
            $query->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->where('status', 'lunas');
        }])->where('status', 'dihuni')
        ->get()
        ->sortBy('house_code', SORT_NATURAL | SORT_FLAG_CASE)
        ->values();

        foreach ($occupiedHousesList as $house) {
            $resident = $house->activeResidentRelation ? $house->activeResidentRelation->resident : null;
            if (!$resident) {
                continue;
            }

            $housePayments = $house->payments->pluck('type')->toArray();
            $kebersihanLunas = in_array('kebersihan', $housePayments);
            $satpamLunas = in_array('satpam', $housePayments);

            if (!$kebersihanLunas || !$satpamLunas) {
                $unpaidList[] = [
                    'house_code' => $house->house_code,
                    'resident_name' => $resident->name,
                    'kebersihan_lunas' => $kebersihanLunas,
                    'satpam_lunas' => $satpamLunas,
                ];
            }
        }

        return response()->json([
            'total_residents' => $totalResidents,
            'occupied_houses' => $occupiedHouses,
            'unoccupied_houses' => $unoccupiedHouses,
            'total_houses' => $totalHouses,
            'occupancy_rate' => $occupancyRate,
            'total_inflow' => $totalInflow,
            'total_outflow' => $totalOutflow,
            'current_balance' => $currentBalance,
            'net_balance' => $currentBalance,
            'current_month_inflow' => $monthInflow,
            'monthly_income' => $monthInflow,
            'current_month_outflow' => $monthOutflow,
            'unpaid_list' => $unpaidList,
        ]);
    }

    public function getFinanceChart()
    {
        $chartData = [];

        $startOfWindow = Carbon::now()->subMonths(11)->startOfMonth();
        
        $preIncome = Payment::where('status', 'lunas')
            ->where('payment_date', '<', $startOfWindow)
            ->sum('amount');

        $preExpense = Expense::where('date', '<', $startOfWindow)
            ->sum('amount');

        $runningBalance = $preIncome - $preExpense;

        // Generate data for the past 12 months
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            
            $monthsIndo = [
                1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
                7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
            ];
            $monthLabel = $monthsIndo[$month] . ' ' . $year;

            // Sum of payments in this month/year actually paid
            $income = Payment::where('status', 'lunas')
                ->whereMonth('payment_date', $month)
                ->whereYear('payment_date', $year)
                ->sum('amount');

            // Sum of expenses in this month/year
            $expense = Expense::whereMonth('date', $month)
                ->whereYear('date', $year)
                ->sum('amount');

            $runningBalance += ($income - $expense);

            $chartData[] = [
                'name' => $monthLabel,
                'pemasukan' => intval($income),
                'pengeluaran' => intval($expense),
                'saldo' => intval($runningBalance),
                'month' => $month,
                'year' => $year,
            ];
        }

        return response()->json($chartData);
    }

    public function getMonthlyReport(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
        ]);

        $month = intval($request->query('month'));
        $year = intval($request->query('year'));

        $monthsIndo = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        // Get detailed incomes based on payment_date (actual transaction date)
        $incomes = Payment::with(['house', 'resident'])
            ->where('status', 'lunas')
            ->whereMonth('payment_date', $month)
            ->whereYear('payment_date', $year)
            ->get()
            ->map(function ($payment) use ($monthsIndo) {
                $billingMonthName = $monthsIndo[$payment->month] ?? 'Bulan';
                return [
                    'id' => $payment->id,
                    'type' => 'Pemasukan - ' . ucfirst($payment->type),
                    'house_code' => $payment->house->house_code,
                    'resident_name' => $payment->resident->name,
                    'description' => 'Iuran ' . ucfirst($payment->type) . ' Periode ' . $billingMonthName . ' ' . $payment->year,
                    'amount' => $payment->amount,
                    'date' => $payment->payment_date->format('Y-m-d'),
                ];
            });

        // Get detailed expenses
        $expenses = Expense::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'type' => 'Pengeluaran',
                    'house_code' => '-',
                    'resident_name' => '-',
                    'description' => $expense->description,
                    'amount' => $expense->amount,
                    'date' => $expense->date->format('Y-m-d'),
                ];
            });

        $totalIncome = $incomes->sum('amount');
        $totalExpense = $expenses->sum('amount');
        $balance = $totalIncome - $totalExpense;

        // Combine items for a ledger list
        $ledger = $incomes->concat($expenses)->sortBy('date')->values();

        return response()->json([
            'ledger' => $ledger,
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'balance' => $balance,
        ]);
    }
}
