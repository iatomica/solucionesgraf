import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CheckCircle, Send, Loader2 } from 'lucide-react';
import { useProductStore } from '../../stores/useProductStore';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useQuoteStore } from '../../stores/useQuoteStore';
import { getProductById } from '../../products/productDefinitions';
import { serializeDesign } from '../../utils/serialization';
import { submitQuoteRequest } from '../../api/mockApi';

const formSchema = z.object({
  customerName: z.string().min(2, 'Ingresá tu nombre completo'),
  companyName: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(6, 'Teléfono requerido'),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestQuoteModal: React.FC<RequestQuoteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { configuration } = useProductStore();
  const { elements } = useCanvasStore();
  const { quote } = useQuoteStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const productDef = getProductById(configuration.productId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const designDoc = serializeDesign(
        configuration,
        elements,
        `Presupuesto ${productDef.name}`
      );

      await submitQuoteRequest(
        {
          name: values.customerName,
          email: values.email,
          phone: values.phone,
          company: values.companyName,
          notes: values.comments,
        },
        designDoc,
        configuration
      );
      setSubmittedSuccess(true);
    } catch (err) {
      alert('Error al enviar la solicitud. Por favor reintentá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedSuccess(false);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold">Solicitar Presupuesto Formal</h3>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <h4 className="text-base font-bold text-slate-900">
              ¡Solicitud Enviada con Éxito!
            </h4>

            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Recibimos tu diseño y requerimientos. Nuestro equipo técnico revisará
              la configuración y te enviará la cotización final por email.
            </p>

            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
            >
              Volver al Editor
            </button>
          </div>
        ) : (
          /* Form & Breakdown */
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            {/* Product Summary Box */}
            <div className="p-3 bg-slate-50 border border-gray-200 rounded-lg space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{productDef.name}</span>
                <span className="text-blue-600">{quote.formatted.total}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>
                  Medidas: {configuration.widthCm}×{configuration.heightCm} cm ({quote.formatted.area})
                </span>
                <span>Cant: {configuration.quantity} u.</span>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  {...register('customerName')}
                  placeholder="Ej. Juan Pérez"
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                {errors.customerName && (
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Empresa / Marca
                  </label>
                  <input
                    type="text"
                    {...register('companyName')}
                    placeholder="Opcional"
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="Ej. 11 4455-6677"
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="ejemplo@empresa.com"
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comentarios Adicionales
                </label>
                <textarea
                  {...register('comments')}
                  rows={2}
                  placeholder="Aclaraciones sobre instalación, entrega o detalles de producción..."
                  className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Solicitud</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
