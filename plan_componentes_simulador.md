# 🎯 Plan de Componentes - Simulador de Becas UNIACC

## 📊 **Estado Actual**
- ✅ **Instalados**: 6 componentes básicos
- ❌ **Faltantes**: 21 componentes Shadcn/ui
- 🎯 **Específicos**: 10 componentes del simulador

---

## 🚀 **Fase 1: Instalar Componentes Shadcn/ui Faltantes**

### **Componentes de Formulario (Críticos)**
```bash
# Formularios básicos
npx shadcn-vue@latest add checkbox
npx shadcn-vue@latest add radio-group
npx shadcn-vue@latest add switch
npx shadcn-vue@latest add slider
npx shadcn-vue@latest add date-picker
```

### **Componentes de Navegación (Importantes)**
```bash
# Navegación y progreso
npx shadcn-vue@latest add tabs
npx shadcn-vue@latest add stepper
npx shadcn-vue@latest add breadcrumb
npx shadcn-vue@latest add navigation-menu
```

### **Componentes de Datos (Esenciales)**
```bash
# Visualización de datos
npx shadcn-vue@latest add table
npx shadcn-vue@latest add badge
npx shadcn-vue@latest add progress
npx shadcn-vue@latest add alert
npx shadcn-vue@latest add tooltip
npx shadcn-vue@latest add popover
```

### **Componentes de Interacción (Necesarios)**
```bash
# Modales y feedback
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add sheet
npx shadcn-vue@latest add toast
npx shadcn-vue@latest add alert-dialog
```

### **Componentes de UI (Opcionales)**
```bash
# Elementos adicionales
npx shadcn-vue@latest add loading-spinner
npx shadcn-vue@latest add skeleton
```

---

## 🎯 **Fase 2: Componentes Específicos del Simulador**

### **1. Componentes de Formulario por Paso**

#### **DatosPersonales.vue**
```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Datos Personales</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Formulario de datos personales -->
    </CardContent>
  </Card>
</template>
```

**Campos requeridos:**
- Nombre, apellido
- Email, teléfono
- RUT o pasaporte
- Nacionalidad (select con datos de la BD)
- Fecha de nacimiento

#### **DatosAcademicos.vue**
```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Datos Académicos</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Formulario de datos académicos -->
    </CardContent>
  </Card>
</template>
```

**Campos requeridos:**
- Colegio (búsqueda con autocomplete)
- Carrera deseada
- Nivel educativo actual
- NEM, ranking (condicionales)
- Año de egreso (condicional)

#### **DatosSocioeconomicos.vue**
```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Datos Socioeconómicos</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Formulario de datos socioeconómicos -->
    </CardContent>
  </Card>
</template>
```

**Campos requeridos:**
- Ingreso mensual familiar
- Número de integrantes
- Decil (calculado automáticamente)
- CAE (checkbox)

#### **DatosPAES.vue** (Opcional)
```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Datos PAES (Opcional)</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Formulario de PAES opcional -->
    </CardContent>
  </Card>
</template>
```

**Campos requeridos:**
- ¿Rindió PAES? (switch)
- Puntajes por prueba (condicionales)
- Estado del estudiante

### **2. Componentes de Navegación**

#### **ProgressStepper.vue**
```vue
<template>
  <div class="w-full">
    <Stepper :steps="steps" :current-step="currentStep" />
  </div>
</template>
```

**Pasos:**
1. Datos Personales
2. Datos Académicos
3. Datos Socioeconómicos
4. PAES (Opcional)
5. Resultados

#### **SimuladorForm.vue** (Contenedor principal)
```vue
<template>
  <div class="container mx-auto p-6">
    <ProgressStepper :current-step="currentStep" />
    
    <div class="mt-8">
      <DatosPersonales v-if="currentStep === 1" />
      <DatosAcademicos v-if="currentStep === 2" />
      <DatosSocioeconomicos v-if="currentStep === 3" />
      <DatosPAES v-if="currentStep === 4" />
      <ResultadosSimulacion v-if="currentStep === 5" />
    </div>
  </div>
</template>
```

### **3. Componentes de Resultados**

#### **ResultadosSimulacion.vue**
```vue
<template>
  <div class="space-y-6">
    <ResumenFinanciero :resultados="resultados" />
    <BeneficiosAplicables :beneficios="beneficiosAplicables" />
    <BeneficiosNoAplicables :beneficios="beneficiosNoAplicables" />
    <ComparadorBeneficios :beneficios="beneficios" />
  </div>
</template>
```

#### **ResumenFinanciero.vue**
```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Resumen Financiero</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold">${{ arancelBase }}</div>
          <div class="text-sm text-muted-foreground">Arancel Original</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">-${{ descuentoTotal }}</div>
          <div class="text-sm text-muted-foreground">Descuento Total</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">${{ arancelFinal }}</div>
          <div class="text-sm text-muted-foreground">Arancel Final</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
```

#### **BeneficioCard.vue**
```vue
<template>
  <Card class="hover:shadow-md transition-shadow">
    <CardHeader>
      <div class="flex justify-between items-start">
        <div>
          <CardTitle class="text-lg">{{ beneficio.nombre }}</CardTitle>
          <CardDescription>{{ beneficio.descripcion }}</CardDescription>
        </div>
        <Badge :variant="beneficio.elegible ? 'default' : 'secondary'">
          {{ beneficio.elegible ? 'Aplicable' : 'No aplicable' }}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Tipo:</span>
          <span>{{ beneficio.tipo }}</span>
        </div>
        <div class="flex justify-between">
          <span>Valor:</span>
          <span class="font-semibold">{{ beneficio.valor }}</span>
        </div>
        <div v-if="!beneficio.elegible" class="text-sm text-muted-foreground">
          {{ beneficio.razonElegibilidad }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>
```

### **4. Componentes de Utilidad**

#### **ComparadorBeneficios.vue**
```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Comparar Beneficios</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Beneficio</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="beneficio in beneficios" :key="beneficio.id">
            <TableCell>{{ beneficio.nombre }}</TableCell>
            <TableCell>{{ beneficio.tipo }}</TableCell>
            <TableCell>{{ beneficio.valor }}</TableCell>
            <TableCell>
              <Badge :variant="beneficio.elegible ? 'default' : 'secondary'">
                {{ beneficio.elegible ? 'Aplicable' : 'No aplicable' }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>
```

---

## 🛠️ **Fase 3: Stores de Pinia**

### **SimuladorStore.ts**
```typescript
export const useSimuladorStore = defineStore('simulador', () => {
  const currentStep = ref(1)
  const datosPersonales = ref({})
  const datosAcademicos = ref({})
  const datosSocioeconomicos = ref({})
  const datosPAES = ref({})
  const resultados = ref({})
  
  const puedeSiguiente = computed(() => {
    // Lógica de validación por paso
  })
  
  const simular = async () => {
    // Lógica de simulación
  }
  
  return {
    currentStep,
    datosPersonales,
    datosAcademicos,
    datosSocioeconomicos,
    datosPAES,
    resultados,
    puedeSiguiente,
    simular
  }
})
```

---

## 📋 **Orden de Implementación Recomendado**

### **Semana 1: Componentes Base**
1. Instalar componentes Shadcn/ui faltantes
2. Crear `ProgressStepper.vue`
3. Crear `SimuladorForm.vue` (estructura básica)

### **Semana 2: Formularios**
1. Crear `DatosPersonales.vue`
2. Crear `DatosAcademicos.vue`
3. Crear `DatosSocioeconomicos.vue`
4. Crear `DatosPAES.vue`

### **Semana 3: Resultados**
1. Crear `ResultadosSimulacion.vue`
2. Crear `ResumenFinanciero.vue`
3. Crear `BeneficioCard.vue`
4. Crear `ComparadorBeneficios.vue`

### **Semana 4: Integración**
1. Crear `SimuladorStore.ts`
2. Integrar con Supabase
3. Implementar lógica de cálculo
4. Testing y refinamiento

---

## 🎯 **Componentes Críticos para MVP**

### **Mínimo Viable Product:**
1. ✅ `ProgressStepper.vue`
2. ✅ `SimuladorForm.vue`
3. ✅ `DatosPersonales.vue`
4. ✅ `DatosAcademicos.vue`
5. ✅ `DatosSocioeconomicos.vue`
6. ✅ `ResultadosSimulacion.vue`
7. ✅ `ResumenFinanciero.vue`
8. ✅ `BeneficioCard.vue`

### **Componentes Adicionales:**
- `DatosPAES.vue` (opcional)
- `ComparadorBeneficios.vue` (avanzado)
- `SimuladorStore.ts` (estado)

---

**¡Con este plan tendremos un simulador completo y funcional!** 🚀✨
