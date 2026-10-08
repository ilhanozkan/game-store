import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { css } from "styled-components";
import { IoClose } from "react-icons/io5";
import {
  MdCheckCircleOutline,
  MdErrorOutline,
  MdInfoOutline,
} from "react-icons/md";

import { colors, radii } from "../../styles/theme";

type Tone = "success" | "error" | "info";

type ToastOptions = {
  message: string;
  tone?: Tone;
  action?: { label: string; onClick: () => void };
};

type Toast = ToastOptions & { id: number; tone: Tone };

const DURATION_MS = 5000;
const MAX_VISIBLE = 3;

const ToastContext = createContext<((toast: ToastOptions) => void) | null>(
  null
);

const Viewport = styled.div`
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(24rem, calc(100vw - 2rem));
  pointer-events: none;

  @media screen and (max-width: 768px) {
    right: 1rem;
    bottom: 1rem;
  }
`;

const toneColors: Record<Tone, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.primary,
};

const Item = styled.div<{ $tone: Tone }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 0.875rem 0.875rem 1rem;
  border: 1px solid ${colors.border};
  border-left: 4px solid ${({ $tone }) => toneColors[$tone]};
  border-radius: ${radii.md};
  background: #262628;
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.45);
  pointer-events: auto;
  animation: toast-in 200ms ease-out;

  > svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
    font-size: 1.25rem;
    color: ${({ $tone }) => toneColors[$tone]};
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }
`;

const Message = styled.p`
  flex: 1;
  line-height: 1.45;
`;

const buttonReset = css`
  border: none;
  background: none;
  cursor: pointer;
`;

const Action = styled.button`
  ${buttonReset}
  flex-shrink: 0;
  padding: 0.125rem 0.25rem;
  color: ${colors.primary};
  font-weight: 700;

  &:hover {
    text-decoration: underline;
  }
`;

const Close = styled.button`
  ${buttonReset}
  display: flex;
  flex-shrink: 0;
  padding: 0.125rem;
  color: ${colors.textMuted};
  font-size: 1.125rem;

  &:hover {
    color: #fff;
  }
`;

const icons: Record<Tone, React.ReactElement> = {
  success: <MdCheckCircleOutline aria-hidden />,
  error: <MdErrorOutline aria-hidden />,
  info: <MdInfoOutline aria-hidden />,
};

const ToastItem = ({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) => {
  const [paused, setPaused] = useState(false);

  // Auto-dismiss, pausing while hovered or focused so it can be read.
  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setTimeout(() => onDismiss(toast.id), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);

  return (
    <Item
      $tone={toast.tone}
      role={toast.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {icons[toast.tone]}
      <Message>{toast.message}</Message>
      {toast.action && (
        <Action
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
        >
          {toast.action.label}
        </Action>
      )}
      <Close
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <IoClose aria-hidden />
      </Close>
    </Item>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const showToast = useCallback(
    ({ tone = "success", ...rest }: ToastOptions) => {
      nextId.current += 1;
      const toast = { ...rest, tone, id: nextId.current };
      setToasts((prev) => [...prev, toast].slice(-MAX_VISIBLE));
    },
    []
  );

  const value = useMemo(() => showToast, [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Viewport aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </Viewport>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const showToast = useContext(ToastContext);
  if (!showToast)
    throw new Error("useToast must be used inside <ToastProvider>");
  return showToast;
};
