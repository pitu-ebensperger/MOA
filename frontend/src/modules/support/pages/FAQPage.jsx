import { useState } from "react";

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "¿Cuánto tarda en llegar mi pedido?",
      answer:
        "El tiempo de entrega depende de tu ubicación. En promedio, los envíos nacionales tardan entre 5 y 10 días hábiles. Te enviaremos un número de seguimiento cuando tu pedido sea despachado."
    },
    {
      question: "¿Puedo personalizar los muebles?",
      answer:
        "Sí, ofrecemos opciones de personalización en ciertos productos como sofás, mesas y closets. Puedes elegir el color, tipo de madera o tela desde la página del producto."
    },
    {
      question: "¿Realizan envíos a todo el país?",
      answer:
        "Sí, realizamos envíos a todo el país mediante empresas de paquetería confiables. En zonas rurales, el tiempo de entrega puede ser mayor."
    },
    {
      question: "¿Cuál es su política de devoluciones?",
      answer:
        "Aceptamos devoluciones dentro de los primeros 7 días hábiles después de recibir el producto, siempre que esté en su empaque original y sin usar. Para más información, consulta nuestra política completa en la sección de Términos y Condiciones."
    },
    {
      question: "¿Tienen garantía los muebles?",
      answer:
        "Sí, todos nuestros muebles tienen garantía de 12 meses por defectos de fabricación. No cubre daños ocasionados por mal uso o modificaciones del producto."
    },
    {
      question: "¿Cómo puedo contactar al servicio al cliente?",
      answer:
        "Puedes comunicarte con nuestro equipo a través de correo electrónico . Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 hrs."
    }
  ];

  return (
<main className="max-w-3xl mx-auto p-6 pt-36 pb-20">
     <h1 className="text-3xl font-bold text-center mb-6 text-[#2E2B26]">
  Preguntas Frecuentes
</h1>

      <section className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border rounded-xl shadow-sm bg-gray-50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100 flex justify-between items-center"
            >
              {faq.question}
              <span>{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <div className="px-4 py-3 text-gray-600 border-t bg-white">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
};
