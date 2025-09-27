import { useState, useCallback, useRef } from "react";
import { UserService } from "@/services";

// 简单的防抖函数实现
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export interface ValidationState {
  isChecking: boolean;
  isAvailable: boolean | null;
  message: string;
}

export interface UseUserValidationReturn {
  usernameValidation: ValidationState;
  emailValidation: ValidationState;
  checkUsername: (username: string) => void;
  checkEmail: (email: string) => void;
  resetValidation: () => void;
}

/**
 * 用户验证 Hook - 提供用户名和邮箱的实时可用性检查
 */
export const useUserValidation = (
  excludeUserId?: number
): UseUserValidationReturn => {
  const [usernameValidation, setUsernameValidation] = useState<ValidationState>(
    {
      isChecking: false,
      isAvailable: null,
      message: "",
    }
  );

  const [emailValidation, setEmailValidation] = useState<ValidationState>({
    isChecking: false,
    isAvailable: null,
    message: "",
  });

  // 防抖检查用户名
  const debouncedCheckUsername = useRef(
    debounce(async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameValidation({
          isChecking: false,
          isAvailable: null,
          message: "",
        });
        return;
      }

      setUsernameValidation((prev) => ({
        ...prev,
        isChecking: true,
      }));

      try {
        const response = await UserService.checkUsernameAvailable(username);
        const isAvailable = response.data?.available ?? false;

        setUsernameValidation({
          isChecking: false,
          isAvailable,
          message: isAvailable ? "用户名可用" : "用户名已被使用",
        });
      } catch (error) {
        setUsernameValidation({
          isChecking: false,
          isAvailable: null,
          message: "检查用户名时出错",
        });
      }
    }, 500)
  ).current;

  // 防抖检查邮箱
  const debouncedCheckEmail = useRef(
    debounce(async (email: string) => {
      if (!email || !email.includes("@")) {
        setEmailValidation({
          isChecking: false,
          isAvailable: null,
          message: "",
        });
        return;
      }

      setEmailValidation((prev) => ({
        ...prev,
        isChecking: true,
      }));

      try {
        const response = await UserService.checkEmailAvailable(email);
        const isAvailable = response.data?.available ?? false;

        setEmailValidation({
          isChecking: false,
          isAvailable,
          message: isAvailable ? "邮箱可用" : "邮箱已被使用",
        });
      } catch (error) {
        setEmailValidation({
          isChecking: false,
          isAvailable: null,
          message: "检查邮箱时出错",
        });
      }
    }, 500)
  ).current;

  const checkUsername = useCallback(
    (username: string) => {
      debouncedCheckUsername(username);
    },
    [debouncedCheckUsername]
  );

  const checkEmail = useCallback(
    (email: string) => {
      debouncedCheckEmail(email);
    },
    [debouncedCheckEmail]
  );

  const resetValidation = useCallback(() => {
    setUsernameValidation({
      isChecking: false,
      isAvailable: null,
      message: "",
    });
    setEmailValidation({
      isChecking: false,
      isAvailable: null,
      message: "",
    });
  }, []);

  return {
    usernameValidation,
    emailValidation,
    checkUsername,
    checkEmail,
    resetValidation,
  };
};
