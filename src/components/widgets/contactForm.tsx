import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { useToast } from "@components/ui/use-toast";

import { sendMail } from "@src/lib/mail";

const formSchema = z.object({
  fullname: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  subject: z.string().min(15, {
    message: "Subject should be at least 15 characters",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  message: z.string().min(30, {
    message: "Message must be at least 30 characters.",
  }),
});

export function ContactForm({ token }: { token: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      subject: "",
      email: "",
      message: "",
    },
  });

  const toast = useToast(); // Initialize the toast

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await sendMail({
      name: values.fullname,
      email: values.email,
      subject: values.subject,
      message: values.subject,
      token: token,
    });

    if (res) {
      toast.toast({ title: "Mail sent successfully!" });
    } else {
      toast.toast({ title: "Error sending mail!" });
    }

    form.reset({
      fullname: "",
      subject: "",
      email: "",
      message: "",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Your message..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-5">
          Submit
        </Button>
      </form>
    </Form>
  );
}
