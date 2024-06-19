import { useState } from "preact/hooks";
import { Mail, sendMail } from "utils/mail";

const ContactForm = () => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSending(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const mail = Object.fromEntries(formData) as unknown as Mail;
    const success = await sendMail(mail);

    setIsSending(false);
    setIsSuccess(success);
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <input
        type="text"
        name="name"
        placeholder="Your name"
        required
        disabled={isSending || isSuccess === true}
        class="w-full px-0.5 py-2 border-0 border-b-2 border-slate-500 disabled:border-slate-300 dark:disabled:border-slate-700 bg-transparent focus:outline-0 focus:border-sky-800 dark:focus:border-sky-200 placeholder:text-slate-500 disabled:text-slate-500"
      />
      <input
        type="email"
        name="email"
        placeholder="Your e-mail"
        required
        disabled={isSending || isSuccess === true}
        class="w-full px-0.5 py-2 border-0 border-b-2 border-slate-500 disabled:border-slate-300 dark:disabled:border-slate-700 bg-transparent focus:outline-0 focus:border-sky-800 dark:focus:border-sky-200 placeholder:text-slate-500 disabled:text-slate-500"
      />
      <textarea
        name="message"
        placeholder="Message"
        required
        disabled={isSending || isSuccess === true}
        class="w-full min-h-[160px] px-0.5 py-2 border-0 border-b-2 border-slate-500 disabled:border-slate-300 dark:disabled:border-slate-700 bg-transparent focus:outline-0 focus:border-sky-800 dark:focus:border-sky-200 placeholder:text-slate-500 disabled:text-slate-500"
      />
      {isSuccess === true ? (
        <p class="w-full px-4 py-2 rounded-lg border-2 border-green-800 dark:border-green-200 font-medium text-green-800 dark:text-green-200 text-center">
          Success!
        </p>
      ) : (
        <button
          type="submit"
          disabled={isSending}
          class={`w-full px-4 py-2 rounded-lg bg-sky-800 dark:bg-sky-200 disabled:bg-slate-800 dark:disabled:bg-slate-200 font-medium text-slate-200 dark:text-slate-800 shadow enabled:hover:brightness-90 enabled:transition-[filter]${
            isSuccess === false ? " bg-red-800 dark:bg-red-200" : ""
          }`}
        >
          {isSending
            ? "Wait a second..."
            : isSuccess === undefined
            ? "Submit"
            : "Sorry, try again."}
        </button>
      )}
    </form>
  );
};

export default ContactForm;
