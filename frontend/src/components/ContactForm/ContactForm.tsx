import { useState, useRef } from "react";
import type { Lang } from "../../i18n";
import { translations } from "../../i18n";
import Toast from "../Toast/Toast";

type Props = {
  currentLanguage: Lang;
};

type Errors = Partial<Record<'name'|'email'|'phone'|'subject'|'message', string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ '´`-]{3,}$/u;
const phoneRegex = /^\d{10,11}$/; // e.g., 11999991234 (10-11 digits)

export default function ContactForm({ currentLanguage }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  const t = translations[currentLanguage].contactErrors;
  const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  const validate = (): Errors => {
    const out: Errors = {};
    if (!name.trim()) out.name = t.nameRequired;
    else if (name.trim().length < 3) out.name = t.nameMin;
    else if (!nameRegex.test(name.trim())) out.name = t.nameInvalid;

    if (!email.trim()) out.email = t.emailRequired;
    else if (!emailRegex.test(email.trim())) out.email = t.emailInvalid;

    if (!phone.trim()) out.phone = t.phoneRequired;
    else if (!phoneRegex.test(phone.replace(/\D/g, ""))) out.phone = t.phoneInvalid;

    if (!subject.trim()) out.subject = t.subjectRequired;
    else if (subject.trim().length < 4) out.subject = t.subjectMin;

    if (!message.trim()) out.message = t.messageRequired;

    return out;
  };

  const focusFirstError = (err: Errors) => {
    if (err.name && nameRef.current) return nameRef.current.focus();
    if (err.email && emailRef.current) return emailRef.current.focus();
    if (err.phone && phoneRef.current) return phoneRef.current.focus();
    if (err.subject && subjectRef.current) return subjectRef.current.focus();
    if (err.message && messageRef.current) return messageRef.current.focus();
  };

  const handleSubmit = async () => {
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      focusFirstError(v);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ''),
          subject: subject.trim(),
          message: message.trim(),
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Success - clear form and show success message
      setSubmitStatus('success');
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      setSubmitStatus('error');
      
      // Reset error message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Toast notifications */}
      {submitStatus === 'success' && (
        <Toast
          type="success"
          message={
            currentLanguage === 'pt' ? 'Mensagem enviada com sucesso! Verifique seu email.' : 
            currentLanguage === 'en' ? 'Message sent successfully! Check your email.' :
            '¡Mensaje enviado con éxito! Revisa tu correo electrónico.'
          }
          onClose={() => setSubmitStatus('idle')}
        />
      )}
      
      {submitStatus === 'error' && (
        <Toast
          type="error"
          message={
            currentLanguage === 'pt' ? 'Erro ao enviar mensagem. Tente novamente.' : 
            currentLanguage === 'en' ? 'Error sending message. Please try again.' :
            'Error al enviar mensaje. Inténtalo de nuevo.'
          }
          onClose={() => setSubmitStatus('idle')}
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="w-full">
          {errors.name && (
            <div id="name-error" className="error-text" role="status">
              {errors.name}
            </div>
          )}
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={translations[currentLanguage].contact.namePlaceholder}
            aria-label={translations[currentLanguage].contact.namePlaceholder}
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
            className={`w-full bg-[#1f1f1f] placeholder-gray-500 text-gray-200 rounded-2xl px-6 py-4 shadow-md ring-1 ring-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 ${errors.name ? 'input-error' : ''}`}
          />
        </div>

        <div className="w-full">
          {errors.email && (
            <div id="email-error" className="error-text" role="status">
              {errors.email}
            </div>
          )}
          <input
            ref={emailRef}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={translations[currentLanguage].contact.emailPlaceholder}
            aria-label={translations[currentLanguage].contact.emailPlaceholder}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            className={`w-full bg-[#1f1f1f] placeholder-gray-500 text-gray-200 rounded-2xl px-6 py-4 shadow-md ring-1 ring-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 ${errors.email ? 'input-error' : ''}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {errors.phone && (
              <div id="phone-error" className="error-text" role="status">
                {errors.phone}
              </div>
            )}
            <input
              ref={phoneRef}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder={translations[currentLanguage].contact.phonePlaceholder}
              aria-label={translations[currentLanguage].contact.phonePlaceholder}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              aria-invalid={!!errors.phone}
              className={`w-full bg-[#1f1f1f] placeholder-gray-500 text-gray-200 rounded-2xl px-6 py-4 shadow-md ring-1 ring-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 ${errors.phone ? 'input-error' : ''}`}
            />
          </div>

          <div>
            {errors.subject && (
              <div id="subject-error" className="error-text" role="status">
                {errors.subject}
              </div>
            )}
            <input
              ref={subjectRef}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={translations[currentLanguage].contact.subjectPlaceholder}
              aria-label={translations[currentLanguage].contact.subjectPlaceholder}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
              aria-invalid={!!errors.subject}
              className={`w-full bg-[#1f1f1f] placeholder-gray-500 text-gray-200 rounded-2xl px-6 py-4 shadow-md ring-1 ring-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 ${errors.subject ? 'input-error' : ''}`}
            />
          </div>
        </div>

        <div className="w-full">
          {errors.message && (
            <div id="message-error" className="error-text" role="status">
              {errors.message}
            </div>
          )}
          <textarea
            ref={messageRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={translations[currentLanguage].contact.messagePlaceholder}
            aria-label={translations[currentLanguage].contact.messagePlaceholder}
            aria-describedby={errors.message ? 'message-error' : undefined}
            aria-invalid={!!errors.message}
            rows={6}
            className={`w-full bg-[#1f1f1f] placeholder-gray-500 text-gray-200 rounded-2xl px-6 py-4 shadow-md ring-1 ring-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 resize-none ${errors.message ? 'input-error' : ''}`}
          />
        </div>

        <div className="w-full">
          <button
            onClick={handleSubmit}
            type="button"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#7D44FF] to-[#B321FA] text-white py-4 rounded-2xl font-semibold hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (currentLanguage === 'pt' ? 'Enviando...' : currentLanguage === 'en' ? 'Sending...' : 'Enviando...')
              : translations[currentLanguage].contact.sendButton
            }
          </button>
        </div>
      </div>
    </div>
  );
}
