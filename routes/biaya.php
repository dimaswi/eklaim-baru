<?php

use App\Http\Controllers\Biaya\BiayaController;
use App\Http\Controllers\Biaya\CompareController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    // Biaya routes
    Route::get('/biaya', [BiayaController::class, 'index'])->name('biaya.index')->middleware('permission:biaya.view');
    Route::post('/biaya/pengajuan-klaim', [BiayaController::class, 'pengajuanKlaim'])->name('biaya.pengajuan-klaim')->middleware('permission:biaya.create');

    // Compare routes
    Route::get('/biaya/compare/{kunjungan}', [CompareController::class, 'index'])->name('biaya.compare')->middleware('permission:biaya.view');
    Route::post('/biaya/compare/grouping', [CompareController::class, 'doGrouping'])->name('biaya.compare.grouping')->middleware('permission:biaya.create');
    Route::post('/biaya/compare/stage2', [CompareController::class, 'stage2Only'])->name('biaya.compare.stage2')->middleware('permission:biaya.create');
    Route::post('/biaya/compare/final', [CompareController::class, 'finalOnly'])->name('biaya.compare.final')->middleware('permission:biaya.update');
    Route::post('/biaya/compare/resubmit-grouping', [CompareController::class, 'resubmitGrouping'])->name('biaya.compare.resubmit-grouping')->middleware('permission:biaya.create');
    Route::post('/biaya/compare/reedit', [CompareController::class, 'reedit'])->name('biaya.compare.reedit')->middleware('permission:biaya.update');
});