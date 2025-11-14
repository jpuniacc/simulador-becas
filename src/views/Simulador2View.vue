<script setup lang="ts">
import { ref, nextTick } from 'vue';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import StepItem from 'primevue/stepitem';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Button from 'primevue/button';
import Message from 'primevue/message';
import PersonalAcademicData from '@/components/simulador/PersonalAcademicData.vue';
import CareerFinancing from '@/components/simulador/CareerFinancing.vue';
import Results from '@/components/simulador/Results.vue';
import type { FormData } from '@/types/simulador';

// Estado del formulario
const formData = ref<Partial<FormData>>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    identificacion: '',
    tipoIdentificacion: 'rut',
    nivelEducativo: '',
    regionResidencia: '',
    comunaResidencia: '',
    colegio: '',
    añoEgreso: '',
    ranking: null,
    carrera: '',
    carreraId: 0,
    tipoPrograma: 'Regular',
    rendioPAES: false,
    planeaUsarCAE: false,
    usaBecasEstado: false,
    decil: null
});

// Referencia al componente de datos personales para acceder a la validación
const personalDataRef = ref<InstanceType<typeof PersonalAcademicData> | null>(null);

// Referencia al componente de carrera y financiamiento
const careerFinancingRef = ref<InstanceType<typeof CareerFinancing> | null>(null);

// Referencia al componente de resultados
const resultsRef = ref<InstanceType<typeof Results> | null>(null);

// Estado de validación del formulario
const isStep1Valid = ref(false);
const isStep2Valid = ref(false);

// Handler para actualizar formData desde el componente hijo
const handleFormDataUpdate = (data: Partial<FormData>) => {
    formData.value = { ...formData.value, ...data };
    console.log('formData', formData.value)
};

// Handler para cambios en la validación del paso 1
const handleValidationChange = (isValid: boolean) => {
    isStep1Valid.value = isValid;
};

// Handler para cambios en la validación del paso 2
const handleValidationChangeStep2 = (isValid: boolean) => {
    isStep2Valid.value = isValid;
};

// Handler para avanzar al paso 3 y ejecutar simulación
const handleNextToStep3 = async (activateCallback: (step: string) => void) => {
    // Activar el paso 3
    activateCallback('3');

    // Esperar a que el componente Results se monte
    await nextTick();

    // Esperar un momento adicional para asegurar que el componente esté completamente montado
    await new Promise(resolve => setTimeout(resolve, 100));

    // Llamar a simulate en el componente Results
    if (resultsRef.value && 'simulate' in resultsRef.value && typeof resultsRef.value.simulate === 'function') {
        await resultsRef.value.simulate();
    }
};
</script>

<template>
    <div class="main-container">
        <div class="header-container">
            <h1>Simulador de Becas UNIACC</h1>
        </div>
        <div class="content-container">
            <Stepper value="1" linear class="w-full sm:basis-[30rem] md:basis-[40rem] lg:basis-[50rem]">
                <StepList class="stepper-header sticky top-0 z-10 bg-white py-4">
                    <Step value="1">
                        <!-- Corto en móvil -->
                        <span class="md:hidden">Datos</span>
                        <!-- Largo en desktop -->
                        <span class="hidden md:inline">Datos Personales</span>
                    </Step>

                    <Step value="2">
                        <span class="md:hidden">Carrera</span>
                        <span class="hidden md:inline">Tu Carrera</span>
                    </Step>

                    <Step value="3">
                        <span class="md:hidden">Resumen</span>
                        <span class="hidden md:inline">Resultados</span>
                    </Step>
                </StepList>
                <Message severity="info" :closable="true" size="small" class="mb-1">
                    <template #icon>
                        <i class="pi pi-shield"></i>
                    </template>
                    <span class="font-semibold"> Tus datos se usan sólo para esta simulación</span>
                    <span class="text-gray-600">. Al continuar, aceptas su uso.</span>
                </Message>
                <StepPanels>
                    <StepPanel v-slot="{ activateCallback }" value="1">
                        <div class="stepper-panel flex flex-col">
                            <PersonalAcademicData ref="personalDataRef" :form-data="formData"
                                @update:form-data="handleFormDataUpdate" @validation-change="handleValidationChange" />
                        </div>
                        <div class="flex pt-6 justify-end">
                            <div class="m-4 button-wrapper" @mousedown="() => {
                                if (personalDataRef && 'markAsSubmitted' in personalDataRef && typeof personalDataRef.markAsSubmitted === 'function') {
                                    personalDataRef.markAsSubmitted()
                                }
                                // Esperar un tick para que se actualicen los errores antes de verificar validación
                                nextTick(() => {
                                    if (isStep1Valid) {
                                        activateCallback('2')
                                    }
                                })
                            }">
                                <Button label="Siguiente" icon="pi pi-arrow-right" :disabled="!isStep1Valid" />
                            </div>
                        </div>
                    </StepPanel>
                    <StepPanel v-slot="{ activateCallback }" value="2">
                        <div class="flex flex-col">
                            <CareerFinancing ref="careerFinancingRef" :form-data="formData"
                                @update:form-data="handleFormDataUpdate"
                                @validation-change="handleValidationChangeStep2" />
                        </div>
                        <div class="flex pt-6 justify-between">
                            <Button label="Atras" class="m-4" severity="secondary" icon="pi pi-arrow-left"
                                @click="activateCallback('1')" />
                            <Button label="Ver resultados" icon="pi pi-arrow-right" class="m-4" iconPos="right"
                                :disabled="!isStep2Valid" @click="() => handleNextToStep3(activateCallback)" />
                        </div>
                    </StepPanel>
                    <StepPanel v-slot="{ activateCallback }" value="3">
                        <div class="flex flex-col">
                            <Results ref="resultsRef" :form-data="formData" />
                        </div>
                        <div class="pt-6">
                            <Button label="Atras" class="m-4" severity="secondary" icon="pi pi-arrow-left"
                                @click="activateCallback('2')" />
                        </div>
                    </StepPanel>
                </StepPanels>
            </Stepper>
        </div>
        <div class="footer-container">

        </div>
    </div>
</template>

<style scoped>
.main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
}

.header-container {
    width: 100%;
    max-width: 50rem;
    background-color: #000000;
    color: #ffffff;
    padding: 2rem;
    position: relative;
    margin-bottom: 2rem;
}

.header-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right,
            #FF6B35 0%,
            #FF6B35 33.33%,
            #4ECDC4 33.33%,
            #4ECDC4 66.66%,
            #FF6B9D 66.66%,
            #FF6B9D 100%);
}

.header-container h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
    text-align: center;
}

.content-container {
    width: 100%;
    max-width: 50rem;
    display: flex;
    justify-content: center;
}

.stepper-header {
    @apply rounded p-3 !important
}

.stepper-panel {
    @apply rounded !important
}

/* Estilos para el StepList sticky */
:deep(.p-steplist) {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: white;
    padding: 1rem 0;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Estilos para el wrapper del botón deshabilitado */
.button-wrapper {
    position: relative;
    cursor: pointer;
}

.button-wrapper :deep(.p-button:disabled) {
    pointer-events: none;
}
</style>