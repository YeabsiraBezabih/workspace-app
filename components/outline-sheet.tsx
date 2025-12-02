"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOutlineSchema, sectionTypeEnum, outlineStatusEnum, reviewerEnum } from "@/lib/validations";
import { useActiveOrganization } from "@/lib/auth-client";

type OutlineFormValues = z.infer<typeof createOutlineSchema>;

interface OutlineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outline?: any; // Replace with proper type
  onSuccess: () => void;
}

export function OutlineSheet({
  open,
  onOpenChange,
  outline,
  onSuccess,
}: OutlineSheetProps) {
  const { data: activeOrg } = useActiveOrganization();
  const [loading, setLoading] = useState(false);

  const form = useForm<OutlineFormValues>({
    resolver: zodResolver(createOutlineSchema),
    defaultValues: {
      header: (outline?.header as string) || "",
      sectionType: (outline?.sectionType as any) || "TABLE_OF_CONTENTS",
      status: (outline?.status as any) || "PENDING",
      target: (outline?.target as number) || 0,
      limit: (outline?.limit as number) || 0,
      reviewer: (outline?.reviewer as any) || "ASSIM",
    },
  });

  // Reset form when outline changes
  useEffect(() => {
    if (outline) {
      form.reset({
        header: outline.header,
        sectionType: outline.sectionType,
        status: outline.status,
        target: outline.target,
        limit: outline.limit,
        reviewer: outline.reviewer,
      });
    } else {
      form.reset({
        header: "",
        sectionType: "TABLE_OF_CONTENTS",
        status: "PENDING",
        target: 0,
        limit: 0,
        reviewer: "ASSIM",
      });
    }
  }, [outline, form]);

  const onSubmit = async (data: OutlineFormValues) => {
    if (!activeOrg?.id) return;

    setLoading(true);
    try {
      const url = outline
        ? `/api/outlines/${outline.id}`
        : "/api/outlines";
      const method = outline ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          organizationId: activeOrg.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save outline");
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto p-6">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl">
            {outline?.header || "Add Section"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            Showing total visitors for the last 6 months
          </SheetDescription>
        </SheetHeader>

        {/* Statistics Card */}
        <div className="my-6 rounded-lg border bg-card p-6">
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">Trending up by 5.2% this month</div>
            <div className="text-xs text-muted3-foreground">
              Showing total visitors for the last 6 months. This is just closer random, not to feel the layout, it spans multiple lines to show wrap around.
            </div>
          </div>

          {/* Simple chart placeholder */}
          <div className="h-32 bg-muted/20 rounded flex items-end justify-around p-4 gap-2">
            <div className="w-full bg-primary/60 h-16 rounded-sm"></div>
            <div className="w-full bg-primary/40 h-24 rounded-sm"></div>
            <div className="w-full bg-primary h-28 rounded-sm"></div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Field */}
            <FormField
              control={form.control}
              name="header"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Header</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type and Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sectionTypeEnum.options.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outlineStatusEnum.options.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Target and Limit Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Target</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reviewer Field */}
            <FormField
              control={form.control}
              name="reviewer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Reviewer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reviewerEnum.options.map((reviewer) => (
                        <SelectItem key={reviewer} value={reviewer}>
                          {reviewer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary hover:bg-primary/90"
              >
                {loading ? "Saving..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full h-11"
              >
                Done
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
