<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-middleware', function () {
    return response()->json(['message' => 'Middleware verified and executed! Check storage/logs/laravel.log']);
})->middleware('log.requests');
