"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phone } from "phone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { useRegisterUser } from "@/service";
import { useWebSocket } from "@/context/websocket-provider";

// Zod schema with custom phone validation
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => phone("+" + val).isValid, "Invalid phone number"),
});

type FormValues = z.infer<typeof schema>;

const RegisterUser = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
    },
  });

  const { chatId } = useWebSocket();
  const { register, registerLoading } = useRegisterUser();

  const onSubmit = (data: FormValues) => {
    if (!registerLoading)
      register({
        chat_id: chatId || "",
        name: data?.name,
        phone_number: data?.phone_number,
        email: data?.email,
      });
  };

  return (
    <div className="space-y-6 h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={(val) => field.onChange(val || "")}
                    placeholder="255 650 000 000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={registerLoading}
            loading={registerLoading}
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterUser;
