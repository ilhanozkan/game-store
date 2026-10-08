import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastProvider, useToast } from "./ToastContext";

const Trigger = ({ onAction }: { onAction?: () => void }) => {
  const showToast = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          showToast({
            message: "Added to cart",
            action: onAction && { label: "View cart", onClick: onAction },
          })
        }
      >
        success
      </button>
      <button
        type="button"
        onClick={() => showToast({ message: "Nope", tone: "error" })}
      >
        error
      </button>
    </>
  );
};

describe("ToastProvider", () => {
  afterEach(() => jest.useRealTimers());

  it("announces messages and dismisses them automatically", () => {
    jest.useFakeTimers();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    act(() => screen.getByRole("button", { name: "success" }).click());
    expect(screen.getByRole("status")).toHaveTextContent("Added to cart");

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("uses an alert for errors and can be dismissed by hand", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "error" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Nope");

    await userEvent.click(
      screen.getByRole("button", { name: "Dismiss notification" })
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("runs the action and closes the toast", async () => {
    const onAction = jest.fn();
    render(
      <ToastProvider>
        <Trigger onAction={onAction} />
      </ToastProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "success" }));
    await userEvent.click(screen.getByRole("button", { name: "View cart" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
