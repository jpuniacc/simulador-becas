<script setup lang="ts">
import { ref, nextTick } from 'vue';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Button from 'primevue/button';
import Message from 'primevue/message';
import CareerPostgrado from '@/components/postgrado/CareerPostgrado.vue';
import PersonalAcademicData from '@/components/simulador/PersonalAcademicData.vue';
import ResultsPostgrado from '@/components/postgrado/ResultsPostgrado.vue';
import { useProspectos } from '@/composables/useProspectos';
import type { FormData } from '@/types/simulador';

// Estado del formulario
const formData = ref<Partial<FormData>>({
    // Datos de postgrado
    carreraTitulo: '',
    area: '',
    modalidadPreferencia: [],
    objetivo: [],
    // Datos personales
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    identificacion: '',
    tipoIdentificacion: 'rut',
    tieneRUT: true,
    paisPasaporte: '',
    nivelEducativo: '',
    regionResidencia: '',
    comunaResidencia: '',
    colegio: '',
    añoEgreso: '',
    ranking: null,
    nem: null
});

// Referencia al componente de carrera postgrado para acceder a la validación
const careerPostgradoRef = ref<InstanceType<typeof CareerPostgrado> | null>(null);

// Referencia al componente de datos personales para acceder a la validación
const personalDataRef = ref<InstanceType<typeof PersonalAcademicData> | null>(null);

// Composables
const { insertarProspecto, loading: prospectoLoading } = useProspectos();

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

// Handler para avanzar al paso siguiente
const handleNext = (activateCallback: (step: string) => void, nextStep: string) => {
    if (careerPostgradoRef.value && 'markAsSubmitted' in careerPostgradoRef.value && typeof careerPostgradoRef.value.markAsSubmitted === 'function') {
        careerPostgradoRef.value.markAsSubmitted()
    }
    // Esperar un tick para que se actualicen los errores antes de verificar validación
    nextTick(() => {
        if (isStep1Valid.value) {
            activateCallback(nextStep)
        }
    })
};

// Handler para avanzar al paso 3 y guardar prospecto
const handleNextToStep3 = async (activateCallback: (step: string) => void) => {
    // Marcar formulario como submitted si es necesario
    if (personalDataRef.value && 'markAsSubmitted' in personalDataRef.value && typeof personalDataRef.value.markAsSubmitted === 'function') {
        personalDataRef.value.markAsSubmitted()
    }
    
    // Esperar un tick para que se actualicen los errores antes de verificar validación
    await nextTick();
    
    // Verificar validación antes de avanzar
    if (!isStep2Valid.value) {
        console.warn('El formulario no es válido');
        return;
    }
    
    // Activar el paso 3
    activateCallback('3');
    
    // Insertar prospecto en la base de datos
    try {
        const prospecto = await insertarProspecto(formData.value as FormData, 'postgrado');
        if (prospecto) {
            console.log('Prospecto insertado correctamente:', prospecto);
        } else {
            console.error('Error al insertar prospecto');
        }
    } catch (error) {
        console.error('Error al insertar prospecto:', error);
    }
};
</script>

<template>
    <div class="main-container">
        <div class="header-container">
            <h1>Programas Postgrado UNIACC</h1>
        </div>
        <div class="content-container">
            <Stepper value="1" linear class="w-full sm:basis-[30rem] md:basis-[40rem] lg:basis-[50rem]">
                <StepList class="stepper-header sticky top-0 z-10 bg-white py-4">
                    <Step value="1">
                        <!-- Corto en móvil -->
                        <span class="md:hidden">Carrera</span>
                        <!-- Largo en desktop -->
                        <span class="hidden md:inline">Tu Carrera</span>
                    </Step>

                    <Step value="2">
                        <span class="md:hidden">Datos</span>
                        <span class="hidden md:inline">Datos Personales</span>
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
                    <span class="font-semibold"> Tus datos se usan sólo para este formulario</span>
                    <span class="text-gray-600">. Al continuar, aceptas su uso.</span>
                </Message>
                <StepPanels>
                    <StepPanel v-slot="{ activateCallback }" value="1">
                        <div class="stepper-panel flex flex-col">
                            <CareerPostgrado 
                                ref="careerPostgradoRef" 
                                :form-data="formData"
                                @update:form-data="handleFormDataUpdate" 
                                @validation-change="handleValidationChange" 
                            />
                        </div>
                        <div class="flex pt-6 justify-end">
                            <div class="m-4 button-wrapper" @mousedown="() => {
                                if (careerPostgradoRef && 'markAsSubmitted' in careerPostgradoRef && typeof careerPostgradoRef.markAsSubmitted === 'function') {
                                    careerPostgradoRef.markAsSubmitted()
                                }
                                // Esperar un tick para que se actualicen los errores antes de verificar validación
                                nextTick(() => {
                                    if (isStep1Valid) {
                                        activateCallback('2')
                                    }
                                })
                            }">
                                <Button 
                                    label="Siguiente" 
                                    icon="pi pi-arrow-right" 
                                    :disabled="!isStep1Valid"
                                />
                            </div>
                        </div>
                    </StepPanel>
                    <StepPanel v-slot="{ activateCallback }" value="2">
                        <div class="stepper-panel flex flex-col">
                            <PersonalAcademicData 
                                ref="personalDataRef" 
                                :form-data="formData"
                                modo="especializacion"
                                @update:form-data="handleFormDataUpdate" 
                                @validation-change="handleValidationChangeStep2" 
                            />
                        </div>
                        <div class="flex pt-6 justify-between">
                            <Button 
                                label="Atras" 
                                class="m-4" 
                                severity="secondary" 
                                icon="pi pi-arrow-left"
                                @click="activateCallback('1')" 
                            />
                            <Button 
                                label="Ver resultados" 
                                icon="pi pi-arrow-right" 
                                class="m-4" 
                                iconPos="right"
                                :disabled="!isStep2Valid" 
                                @click="() => handleNextToStep3(activateCallback)" 
                            />
                        </div>
                    </StepPanel>
                    <StepPanel v-slot="{ activateCallback }" value="3">
                        <div class="flex flex-col">
                            <div v-if="prospectoLoading" class="text-gray-600 mb-4">
                                Guardando información...
                            </div>
                            <ResultsPostgrado 
                                :area="formData.area || ''"
                                :modalidad-preferencia="formData.modalidadPreferencia && formData.modalidadPreferencia.length > 0 ? formData.modalidadPreferencia : null"
                            />
                        </div>
                        <div class="pt-6">
                            <Button 
                                label="Atras" 
                                class="m-4" 
                                severity="secondary" 
                                icon="pi pi-arrow-left"
                                @click="activateCallback('2')" 
                            />
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
