"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { robotoCondensed } from "@/lib/fonts/robotoCondensed";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"

import { createWorker } from "tesseract.js";
import PdfParse from "pdf-parse";

export const formSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(128, "Name must be at most 128 characters"),

  email: z.string()
    .email("Invalid email format"),

  linkedin: z.string()
    .url("Invalid LinkedIn URL")
    .regex(/^https:\/\/(www\.)?linkedin\.com\/.*$/, "Must be a valid LinkedIn profile URL"),

  resume: z.union([
    z.instanceof(File).refine(file => file.type === "application/pdf", {
      message: "Resume must be a PDF file"
    }),
    z.string().min(10, "Resume text must have at least 10 characters")
  ]).optional(),

  skills: z.array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required")
    .max(20, "A maximum of 20 skills can be added"),

  experience: z.string()
    .min(10, "Experience description must be at least 10 characters")
    .max(1000, "Experience description is too long")
});


export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      linkedin: "",
      resume: "",
      skills: [],
      experience: "",
    },
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const parseResumeData = async (text: string) => {
    try {
      const response = await fetch("http://localhost:5000/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }), // Send parsed text
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await response.json();
      console.log("Extracted Resume Data:", data);

      return data; // Return parsed resume data
    } catch (error) {
      console.error("Error sending text to Flask API:", error);
    }
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log(values);
    if (values.resume instanceof File) {
      try {
        const arrayBuffer = await values.resume.arrayBuffer();
        const base64File = Buffer.from(arrayBuffer).toString("base64");

        const response = await fetch("/api/parse-pdf/parser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64File }),
        });

        const data = await response.json();
        console.log("Extracted PDF Text:", data.text);
        const parsedData = await parseResumeData(data.text);
        console.log("Parsed Resume Data:", parsedData);
      } catch (error) {
        console.error("Error sending pdf to API")
      }
    } else if (typeof values.resume === "string") {
      console.log("Manual Resume Text:", values.resume);
    }
  }
  return (
    <div className="flex flex-col justify-center h-auto items-center">
      <Card className={cn("w-[680px]", robotoCondensed.className)}>
        <CardHeader>
          <CardTitle>Candidate Submission</CardTitle>
          <CardDescription>Provide your personal and professional details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 w-full border rounded-lg shadow-md">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} value="John Doe" />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="johndoe@example.com" {...field} value="johndoe@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LinkedIn */}
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://linkedin.com/in/yourname" {...field} value="https://linkedin.com/in/yourname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Resume Upload */}
              <FormItem>
                <FormLabel>Resume Upload</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      form.setValue("resume", file as any);
                    }}
                  />
                </FormControl>
                <FormDescription>Upload your resume in PDF format.</FormDescription>
                <FormMessage />
              </FormItem>

              {/* Resume Text Input */}
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume (Text Input)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alternatively, paste your resume text here"
                        value={typeof field.value === "string" ? field.value : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skills */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Next.js, TypeScript, Tailwind"
                        value="Next.js, TypeScript, Tailwind"
                        onChange={(e) => {
                          field.onChange(e.target.value.split(",").map((s) => s.trim()));
                        }}
                      />
                    </FormControl>
                    <FormDescription>List your key skills, separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Experience</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Summarize your relevant work experience..." {...field}
                        value="Summarize your relevant work experience..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">Your information will be handled with the utmost confidentiality.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
