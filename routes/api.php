<?php

use App\Http\Controllers\ResidentController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// Dashboard & Reports
Route::get('/dashboard/summary', [DashboardController::class, 'getSummary']);
Route::get('/dashboard/finance-chart', [DashboardController::class, 'getFinanceChart']);
Route::get('/reports/monthly', [DashboardController::class, 'getMonthlyReport']);

// Residents
Route::apiResource('residents', ResidentController::class);

// Houses
Route::apiResource('houses', HouseController::class);
Route::post('/houses/{id}/assign', [HouseController::class, 'assignResident']);
Route::get('/houses/{id}/history', [HouseController::class, 'history']);

// Payments
Route::apiResource('payments', PaymentController::class);
Route::get('/billing-status', [PaymentController::class, 'getBillingStatus']);

// Expenses
Route::apiResource('expenses', ExpenseController::class);
