<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('app')->create('tagihans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengajuan_klaim_id')->constrained('pengajuan_klaim')->onDelete('cascade');
            $table->string('nomor_kunjungan');
            $table->json('data_pasien')->nullable(); // simpan data pasien sebagai JSON
            $table->json('rincian_tagihan')->nullable(); // simpan rincian tagihan sebagai JSON
            $table->decimal('total_tagihan', 15, 2)->default(0);
            $table->string('nama_petugas')->nullable();
            $table->timestamps();
            
            $table->unique(['pengajuan_klaim_id', 'nomor_kunjungan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('tagihans');
    }
};
