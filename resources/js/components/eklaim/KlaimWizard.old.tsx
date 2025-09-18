import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

interface WizardStep {
    id: number;
    title: string;
    component: React.ComponentType<any>;
    isOptional?: boolean;
}

interface KlaimWizardProps {
    pengajuanKlaim: any;
    referenceData: any;
    existingKlaim?: any;
    resumeMedis?: any;
    onSaveProgress: (step: number, data: any) => Promise<void>;
    onSubmitKlaim: (data: any) => Promise<void>;
}

export default function KlaimWizard({
    pengajuanKlaim,
    referenceData,
    existingKlaim,
    resumeMedis,
    onSaveProgress,
    onSubmitKlaim
}: KlaimWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<{ [key: string]: any }>(existingKlaim || {});
    const [isLoading, setIsLoading] = useState(false);
    const [stepValidation, setStepValidation] = useState<{ [key: number]: boolean }>({});

    // Define wizard steps
    const steps: WizardStep[] = [
        {
            id: 1,
            title: 'Informasi Pasien',
            component: React.lazy(() => import('./steps/PatientInfoStep')),
        },
        {
            id: 2,
            title: 'Detail Perawatan',
            component: React.lazy(() => import('./steps/TreatmentStep')),
        },
        {
            id: 3,
            title: 'Kode Medis',
            component: React.lazy(() => import('./steps/MedicalCodesStep')),
        },
        {
            id: 4,
            title: 'Tarif Rumah Sakit',
            component: React.lazy(() => import('./steps/TariffsStep')),
        },
        {
            id: 5,
            title: 'Kondisi Khusus',
            component: React.lazy(() => import('./steps/SpecialConditionsStep')),
            isOptional: true,
        },
        {
            id: 6,
            title: 'Review & Submit',
            component: React.lazy(() => import('./steps/ReviewStep')),
        },
    ];

    const totalSteps = steps.length;
    const progress = (currentStep / totalSteps) * 100;

    // Update form data for specific step
    const updateStepData = (stepId: number, stepData: any) => {
        setFormData(prev => ({
            ...prev,
            [`step${stepId}`]: stepData,
        }));
    };

    // Auto-save progress
    const handleAutoSave = async (stepId: number, stepData: any) => {
        try {
            await onSaveProgress(stepId, stepData);
            toast.success('Progress tersimpan otomatis');
        } catch (error) {
            console.error('Auto-save error:', error);
            toast.error('Gagal menyimpan progress');
        }
    };

    // Navigate to next step
    const handleNext = async () => {
        if (currentStep < totalSteps) {
            setIsLoading(true);
            try {
                // Validate current step before moving
                const isValid = await validateCurrentStep();
                if (isValid) {
                    // Auto-save current step
                    await handleAutoSave(currentStep, formData[`step${currentStep}`]);
                    setCurrentStep(prev => prev + 1);
                }
            } catch (error) {
                toast.error('Gagal validasi step');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Navigate to previous step
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Validate current step
    const validateCurrentStep = async (): Promise<boolean> => {
        // This will be implemented per step
        return true;
    };

    // Jump to specific step
    const jumpToStep = (stepId: number) => {
        if (stepId <= currentStep || stepValidation[stepId]) {
            setCurrentStep(stepId);
        }
    };

    // Submit final klaim
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onSubmitKlaim(formData);
            toast.success('Klaim berhasil disubmit!');
        } catch (error) {
            toast.error('Gagal submit klaim');
        } finally {
            setIsLoading(false);
        }
    };

    const currentStepData = steps.find(step => step.id === currentStep);
    const CurrentStepComponent = currentStepData?.component;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    E-Klaim: {pengajuanKlaim.nomor_sep}
                </h1>
                <p className="text-gray-600 mt-2">
                    {pengajuanKlaim.nama_pasien} - {pengajuanKlaim.norm}
                </p>
            </div>

            {/* Progress Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                                Step {currentStep} of {totalSteps}
                            </span>
                            <span className="text-sm text-gray-500">
                                {Math.round(progress)}% Complete
                            </span>
                        </div>
                        <Progress value={progress} className="w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Step Navigation */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => jumpToStep(step.id)}
                                disabled={step.id > currentStep && !stepValidation[step.id]}
                                className={`
                                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${step.id === currentStep
                                        ? 'bg-blue-600 text-white'
                                        : step.id < currentStep || stepValidation[step.id]
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }
                                `}
                            >
                                {step.id}. {step.title}
                                {step.isOptional && <span className="text-xs ml-1">(Optional)</span>}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Current Step Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {currentStep}
                        </span>
                        {currentStepData?.title}
                        {currentStepData?.isOptional && (
                            <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <React.Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
                        {CurrentStepComponent && (
                            <CurrentStepComponent
                                data={formData[`step${currentStep}`] || {}}
                                onChange={(data: any) => updateStepData(currentStep, data)}
                                pengajuanKlaim={pengajuanKlaim}
                                referenceData={referenceData}
                                resumeMedis={resumeMedis}
                                formData={formData}
                                onSubmit={currentStep === 6 ? handleSubmit : undefined}
                            />
                        )}
                    </React.Suspense>
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            {currentStep > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={isLoading}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {/* Auto-save indicator */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAutoSave(currentStep, formData[`step${currentStep}`])}
                                disabled={isLoading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Progress
                            </Button>

                            {currentStep < totalSteps ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={isLoading}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Klaim
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}