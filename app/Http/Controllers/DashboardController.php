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

        $totalInflow = Payment::where('status', 'lunas')->sum('amount');
        $totalOutflow = Expense::sum('amount');
        $currentBalance = $totalInflow - $totalOutflow;

        // Current month inflow and outflow
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $monthInflow = Payment::where('status', 'lunas')
            ->where('month', $currentMonth)
            ->where('year', $currentYear)
            ->sum('amount');

        $monthOutflow = Expense::whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        return response()->json([
            'total_residents' => $totalResidents,
            'occupied_houses' => $occupiedHouses,
            'unoccupied_houses' => $unoccupiedHouses,
            'total_inflow' => $totalInflow,
            'total_outflow' => $totalOutflow,
            'current_balance' => $currentBalance,
            'current_month_inflow' => $monthInflow,
            'current_month_outflow' => $monthOutflow,
        ]);
    }

    public function getFinanceChart()
    {
        $chartData = [];

        // Generate data for the past 12 months
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            $monthLabel = $date->format('M Y');

            // Sum of payments in this month/year
            $income = Payment::where('status', 'lunas')
                ->where('month', $month)
                ->where('year', $year)
                ->sum('amount');

            // Sum of expenses in this month/year
            $expense = Expense::whereMonth('date', $month)
                ->whereYear('date', $year)
                ->sum('amount');

            $chartData[] = [
                'name' => $monthLabel,
                'pemasukan' => intval($income),
                'pengeluaran' => intval($expense),
                'saldo' => intval($income - $expense),
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

        // Get detailed incomes
        $incomes = Payment::with(['house', 'resident'])
            ->where('status', 'lunas')
            ->where('month', $month)
            ->where('year', $year)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'Pemasukan - ' . ucfirst($payment->type),
                    'house_code' => $payment->house->house_code,
                    'resident_name' => $payment->resident->name,
                    'description' => 'Iuran ' . ucfirst($payment->type) . ' Bulan ' . Carbon::create(2000, $payment->month, 1)->format('F') . ' ' . $payment->year,
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
