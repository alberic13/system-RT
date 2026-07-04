<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseResident;
use App\Models\Payment;
use App\Models\Resident;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with(['house', 'resident'])
            ->orderBy('payment_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'required|exists:residents,id',
            'type' => 'required|string',
            'amount' => 'nullable|integer',
            'months' => 'required|array', // e.g. [1, 2, 3]
            'months.*' => 'integer|between:1,12',
            'year' => 'required|integer|min:2000|max:2090',
            'payment_date' => 'required|date',
            'payment_proof' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:4096', // max 4MB
        ]);

        $houseId = $validated['house_id'];
        $residentId = $validated['resident_id'];
        $type = $validated['type'];
        $year = $validated['year'];
        $paymentDate = Carbon::parse($validated['payment_date']);
        
        // Handle file upload
        $paymentProof = null;
        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('bukti_bayar', 'public');
            $paymentProof = '/storage/' . $path;
        }

        // Dynamic amount lookup
        $amount = $validated['amount'] ?? (($type === 'kebersihan') ? 15000 : (($type === 'satpam') ? 100000 : 0));

        $createdPayments = [];

        foreach ($validated['months'] as $month) {
            // Check if already paid
            $exists = Payment::where('house_id', $houseId)
                ->where('type', $type)
                ->where('month', $month)
                ->where('year', $year)
                ->where('status', 'lunas')
                ->exists();

            if ($exists) {
                continue; // Skip already paid month
            }

            $payment = Payment::create([
                'house_id' => $houseId,
                'resident_id' => $residentId,
                'type' => $type,
                'amount' => $amount,
                'month' => $month,
                'year' => $year,
                'payment_date' => $paymentDate,
                'status' => 'lunas',
                'payment_proof' => $paymentProof
            ]);

            $createdPayments[] = $payment;
        }

        return response()->json([
            'message' => 'Payments recorded successfully',
            'payments' => $createdPayments
        ], 201);
    }

    public function getBillingStatus(Request $request)
    {
        $month = intval($request->query('month', Carbon::now()->month));
        $year = intval($request->query('year', Carbon::now()->year));

        $houses = House::with(['activeResidentRelation.resident', 'payments'])
            ->get()
            ->sortBy('house_code', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        $billingData = $houses->map(function ($house) use ($month, $year) {
            // Check if the house was occupied (dihuni) in this month/year
            $activeResidency = $house->activeResidentRelation;
            $resident = $activeResidency ? $activeResidency->resident : null;

            $shouldPay = ($house->status === 'dihuni' && $resident !== null);

            // Fetch all payments for this house in this month/year
            $payments = $house->payments
                ->where('month', $month)
                ->where('year', $year)
                ->where('status', 'lunas')
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'type' => $p->type,
                        'amount' => $p->amount,
                        'month' => $p->month,
                        'year' => $p->year,
                        'payment_date' => $p->payment_date ? $p->payment_date->format('Y-m-d') : null,
                        'payment_proof' => $p->payment_proof,
                    ];
                })
                ->values()
                ->toArray();

            // Backward-compatible hardcoded fields
            $kebersihanPaid = collect($payments)->firstWhere('type', 'kebersihan');
            $satpamPaid = collect($payments)->firstWhere('type', 'satpam');

            return [
                'house_id' => $house->id,
                'house_code' => $house->house_code,
                'status' => $house->status,
                'resident_name' => $resident ? $resident->name : null,
                'resident_id' => $resident ? $resident->id : null,
                'should_pay' => $shouldPay,
                'kebersihan_lunas' => $kebersihanPaid !== null,
                'kebersihan_amount' => $kebersihanPaid ? $kebersihanPaid['amount'] : 0,
                'satpam_lunas' => $satpamPaid !== null,
                'satpam_amount' => $satpamPaid ? $satpamPaid['amount'] : 0,
                'payments' => $payments
            ];
        });

        return response()->json($billingData);
    }

    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted successfully'
        ]);
    }
}
