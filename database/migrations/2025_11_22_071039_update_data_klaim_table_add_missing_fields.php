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
        Schema::connection('app')->table('data_klaim', function (Blueprint $table) {
            // Add missing fields identified from frontend analysis
            $table->string('sistole', 10)->nullable()->after('pernapasan');
            $table->string('diastole', 10)->nullable()->after('sistole');
            $table->string('discharge_status', 50)->nullable()->after('diastole');
            $table->string('jenis_rawat', 50)->nullable()->after('discharge_status');
            $table->string('nama_dokter', 255)->nullable()->after('jenis_rawat');
            
            // Tarif Tambahan
            $table->decimal('tarif_poli_eks', 12, 2)->nullable()->after('total_tarif');
            
            // APGAR Scores (nested data stored as JSON but also individual fields for queries)
            $table->json('apgar')->nullable()->after('tarif_poli_eks');
            $table->integer('apgar_appearance_1')->nullable()->after('apgar');
            $table->integer('apgar_pulse_1')->nullable()->after('apgar_appearance_1');
            $table->integer('apgar_grimace_1')->nullable()->after('apgar_pulse_1');
            $table->integer('apgar_activity_1')->nullable()->after('apgar_grimace_1');
            $table->integer('apgar_respiration_1')->nullable()->after('apgar_activity_1');
            $table->integer('apgar_appearance_5')->nullable()->after('apgar_respiration_1');
            $table->integer('apgar_pulse_5')->nullable()->after('apgar_appearance_5');
            $table->integer('apgar_grimace_5')->nullable()->after('apgar_pulse_5');
            $table->integer('apgar_activity_5')->nullable()->after('apgar_grimace_5');
            $table->integer('apgar_respiration_5')->nullable()->after('apgar_activity_5');
            
            // Ventilator Data
            $table->json('ventilator')->nullable()->after('apgar_respiration_5');
            $table->string('ventilator_start_date', 50)->nullable()->after('ventilator');
            $table->string('ventilator_end_date', 50)->nullable()->after('ventilator_start_date');
            $table->string('ventilator_duration', 50)->nullable()->after('ventilator_end_date');
            
            // Funeral Preparation Fields
            $table->string('deceased_date', 50)->nullable()->after('ventilator_duration');
            $table->string('deceased_time', 50)->nullable()->after('deceased_date');
            $table->string('deceased_location', 100)->nullable()->after('deceased_time');
            $table->string('funeral_method', 50)->nullable()->after('deceased_location');
            $table->string('funeral_name', 255)->nullable()->after('funeral_method');
            $table->string('funeral_nik', 16)->nullable()->after('funeral_name');
            $table->string('funeral_family_card', 20)->nullable()->after('funeral_nik');
            
            // Upgrade Class Details
            $table->json('upgrade_class')->nullable()->after('funeral_family_card');
            $table->string('upgrade_class_indication', 100)->nullable()->after('upgrade_class');
            $table->string('upgrade_class_care_class', 50)->nullable()->after('upgrade_class_indication');
            $table->integer('upgrade_class_care_los')->nullable()->after('upgrade_class_care_class');
            $table->string('upgrade_class_payor_detail', 100)->nullable()->after('upgrade_class_care_los');
            
            // COVID-19 Additional Fields
            $table->boolean('is_covid19_suspect')->default(false)->after('upgrade_class_payor_detail');
            $table->boolean('is_covid19_probable')->default(false)->after('is_covid19_suspect');
            $table->boolean('is_covid19_confirmed')->default(false)->after('is_covid19_probable');
            
            // Additional Checkbox Indicators
            $table->boolean('add_payment_pct')->default(false)->after('is_covid19_confirmed');
            $table->boolean('birth_weight_extreme')->default(false)->after('add_payment_pct');
            $table->boolean('fetal_reduction')->default(false)->after('birth_weight_extreme');
            $table->boolean('admission_weight')->default(false)->after('fetal_reduction');
            $table->boolean('chronic_dialysis')->default(false)->after('admission_weight');
            $table->boolean('acute_dialysis')->default(false)->after('chronic_dialysis');
            $table->boolean('ventilator_support')->default(false)->after('acute_dialysis');
            $table->boolean('chemotherapy')->default(false)->after('ventilator_support');
            
            // Treatment Information
            $table->string('los', 10)->nullable()->after('chemotherapy');
            $table->string('birth_weight_grams', 10)->nullable()->after('los');
            $table->string('gestational_age', 10)->nullable()->after('birth_weight_grams');
            $table->text('treatment_history')->nullable()->after('gestational_age');
            $table->text('medication_allergy')->nullable()->after('treatment_history');
            $table->text('food_allergy')->nullable()->after('medication_allergy');
            $table->text('other_allergy')->nullable()->after('food_allergy');
            $table->text('treatment_plan')->nullable()->after('other_allergy');
            $table->text('nursing_care_plan')->nullable()->after('treatment_plan');
            $table->text('special_procedures')->nullable()->after('nursing_care_plan');
            
            // ICD Additional Fields
            $table->string('diagnosa', 1000)->nullable()->after('special_procedures'); // For frontend codes
            $table->string('procedure', 1000)->nullable()->after('diagnosa'); // For frontend codes
            $table->string('diagnosa_inagrouper', 1000)->nullable()->after('procedure');
            $table->string('procedure_inagrouper', 1000)->nullable()->after('diagnosa_inagrouper');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->table('data_klaim', function (Blueprint $table) {
            $table->dropColumn([
                'sistole',
                'diastole',
                'discharge_status',
                'jenis_rawat',
                'nama_dokter',
                'tarif_poli_eks',
                'apgar',
                'apgar_appearance_1',
                'apgar_pulse_1',
                'apgar_grimace_1',
                'apgar_activity_1',
                'apgar_respiration_1',
                'apgar_appearance_5',
                'apgar_pulse_5',
                'apgar_grimace_5',
                'apgar_activity_5',
                'apgar_respiration_5',
                'ventilator',
                'ventilator_start_date',
                'ventilator_end_date',
                'ventilator_duration',
                'deceased_date',
                'deceased_time',
                'deceased_location',
                'funeral_method',
                'funeral_name',
                'funeral_nik',
                'funeral_family_card',
                'upgrade_class',
                'upgrade_class_indication',
                'upgrade_class_care_class',
                'upgrade_class_care_los',
                'upgrade_class_payor_detail',
                'is_covid19_suspect',
                'is_covid19_probable',
                'is_covid19_confirmed',
                'add_payment_pct',
                'birth_weight_extreme',
                'fetal_reduction',
                'admission_weight',
                'chronic_dialysis',
                'acute_dialysis',
                'ventilator_support',
                'chemotherapy',
                'los',
                'birth_weight_grams',
                'gestational_age',
                'treatment_history',
                'medication_allergy',
                'food_allergy',
                'other_allergy',
                'treatment_plan',
                'nursing_care_plan',
                'special_procedures',
                'diagnosa',
                'procedure',
                'diagnosa_inagrouper',
                'procedure_inagrouper',
            ]);
        });
    }
};
