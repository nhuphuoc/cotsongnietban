"use client";

import { toast } from "sonner";
import { ApiError } from "@/lib/admin/api-client";

type CrudAction = "create" | "update" | "delete";

type CrudNotifyOptions = {
  entity: string;
  loadingMessage?: string;
  successMessage?: string;
  fallbackErrorMessage?: string;
  successDescription?: string;
};

type ApiNotifyOptions = {
  id?: string | number;
  fallbackTitle?: string;
};

function toReadableErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra.") {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
}

function defaultMessages(action: CrudAction, entity: string) {
  if (action === "create") {
    return {
      loading: `Đang tạo ${entity}...`,
      success: `Tạo ${entity} thành công.`,
      failure: `Không thể tạo ${entity}.`,
    };
  }
  if (action === "update") {
    return {
      loading: `Đang cập nhật ${entity}...`,
      success: `Cập nhật ${entity} thành công.`,
      failure: `Không thể cập nhật ${entity}.`,
    };
  }
  return {
    loading: `Đang xóa ${entity}...`,
    success: `Xóa ${entity} thành công.`,
    failure: `Không thể xóa ${entity}.`,
  };
}

export function notifyApiProblem(error: unknown, options?: ApiNotifyOptions) {
  const message = toReadableErrorMessage(error, options?.fallbackTitle ?? "Đã có lỗi xảy ra.");

  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    toast.warning("Yêu cầu chưa hợp lệ", {
      id: options?.id,
      description: `${message} (HTTP ${error.status})`,
    });
    return;
  }

  toast.error(options?.fallbackTitle ?? "Lỗi hệ thống", {
    id: options?.id,
    description: message,
  });
}

async function runCrud<T>(action: CrudAction, task: () => Promise<T>, opts: CrudNotifyOptions): Promise<T> {
  const messages = defaultMessages(action, opts.entity);
  const toastId = toast.loading(opts.loadingMessage ?? messages.loading);

  try {
    const result = await task();
    toast.success(opts.successMessage ?? messages.success, {
      id: toastId,
      description: opts.successDescription,
    });
    return result;
  } catch (error) {
    notifyApiProblem(error, {
      id: toastId,
      fallbackTitle: opts.fallbackErrorMessage ?? messages.failure,
    });
    throw error;
  }
}

export const notify = {
  success: (title: string, description?: string) => toast.success(title, { description }),
  info: (title: string, description?: string) => toast.info(title, { description }),
  warning: (title: string, description?: string) => toast.warning(title, { description }),
  error: (title: string, description?: string) => toast.error(title, { description }),
  loading: (title: string) => toast.loading(title),
  dismiss: (id?: string | number) => toast.dismiss(id),
};

export const crudNotify = {
  create: <T>(task: () => Promise<T>, opts: CrudNotifyOptions) => runCrud("create", task, opts),
  update: <T>(task: () => Promise<T>, opts: CrudNotifyOptions) => runCrud("update", task, opts),
  remove: <T>(task: () => Promise<T>, opts: CrudNotifyOptions) => runCrud("delete", task, opts),
};
