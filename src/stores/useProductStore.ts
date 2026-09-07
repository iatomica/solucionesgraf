import { create } from 'zustand';
import type { CanvasShape, GarmentSide, ProductConfiguration, StructureType } from '../types';
import { getProductById, MOCK_PRODUCTS } from '../products/productDefinitions';

interface ProductStoreState {
  configuration: ProductConfiguration;
  setProduct: (productId: string) => void;
  setDimensions: (widthCm: number, heightCm: number) => void;
  setMaterial: (materialId: string) => void;
  setPrintMethod: (printMethodId: string) => void;
  setFinish: (finishId?: string) => void;
  setStructure: (structureId?: StructureType) => void;
  setShape: (shape?: CanvasShape) => void;
  setGarmentColor: (color: string) => void;
  setPrintPlacement: (placement: string) => void;
  setActiveSide: (side: GarmentSide) => void;
  setQuantity: (quantity: number) => void;
  loadConfiguration: (config: ProductConfiguration) => void;
}

const defaultProduct = MOCK_PRODUCTS[0]; // Cartel PVC

const initialConfig: ProductConfiguration = {
  productId: defaultProduct.id,
  widthCm: defaultProduct.defaultWidth,
  heightCm: defaultProduct.defaultHeight,
  materialId: defaultProduct.materials[1].id, // pvc-5mm
  printMethodId: defaultProduct.printMethods[0].id, // uv-color
  finishId: defaultProduct.finishes[1].id, // laminado-mate
  structureId: 'ninguna',
  shape: 'rectangular',
  garmentColor: '#F8FAFC', // Default Blanco Puro
  printPlacement: 'frente-pecho',
  activeSide: 'frente',
  quantity: 2,
};

export const useProductStore = create<ProductStoreState>((set) => ({
  configuration: initialConfig,

  setProduct: (productId: string) => {
    const productDef = getProductById(productId);
    const defaultMat = productDef.materials[0];
    const defaultPrint = productDef.printMethods[0];
    const defaultFinish = productDef.finishes[0]?.id;

    set({
      configuration: {
        productId,
        widthCm: productDef.defaultWidth,
        heightCm: productDef.defaultHeight,
        materialId: defaultMat.id,
        printMethodId: defaultPrint.id,
        finishId: defaultFinish,
        structureId: 'ninguna',
        shape: productDef.defaultShape || 'rectangular',
        garmentColor: '#F8FAFC', // Default Blanco Puro
        printPlacement: 'frente-pecho',
        activeSide: 'frente',
        quantity: 1,
      },
    });
  },

  setDimensions: (widthCm: number, heightCm: number) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        widthCm: Math.max(10, widthCm),
        heightCm: Math.max(10, heightCm),
      },
    }));
  },

  setMaterial: (materialId: string) => {
    set((state) => {
      const productDef = getProductById(state.configuration.productId);
      const material = productDef.materials.find((m) => m.id === materialId);

      let printMethodId = state.configuration.printMethodId;
      if (
        material &&
        !material.compatiblePrintMethodIds.includes(printMethodId)
      ) {
        printMethodId = material.compatiblePrintMethodIds[0];
      }

      let finishId = state.configuration.finishId;
      if (
        material &&
        finishId &&
        !material.compatibleFinishIds.includes(finishId)
      ) {
        finishId = material.compatibleFinishIds[0];
      }

      return {
        configuration: {
          ...state.configuration,
          materialId,
          printMethodId,
          finishId,
        },
      };
    });
  },

  setPrintMethod: (printMethodId: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        printMethodId,
      },
    }));
  },

  setFinish: (finishId?: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        finishId,
      },
    }));
  },

  setStructure: (structureId?: StructureType) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        structureId: structureId || 'ninguna',
      },
    }));
  },

  setShape: (shape?: CanvasShape) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        shape: shape || 'rectangular',
      },
    }));
  },

  setGarmentColor: (color: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        garmentColor: color,
      },
    }));
  },

  setPrintPlacement: (placement: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        printPlacement: placement,
      },
    }));
  },

  setActiveSide: (side: GarmentSide) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        activeSide: side,
      },
    }));
  },

  setQuantity: (quantity: number) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        quantity: Math.max(1, quantity),
      },
    }));
  },

  loadConfiguration: (config: ProductConfiguration) => {
    set({ configuration: { ...config } });
  },
}));

