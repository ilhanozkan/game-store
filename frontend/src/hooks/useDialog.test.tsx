import React, { useRef, useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import useDialog from "./useDialog";

const Dialog = ({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose);
  return (
    <div ref={ref} role="dialog" aria-label={label} tabIndex={-1}>
      {children}
    </div>
  );
};

const Harness = () => {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);
  const [items, setItems] = useState(["a", "b"]);
  return (
    <>
      <button type="button" onClick={() => setOuter(true)}>
        open outer
      </button>
      {outer && (
        <Dialog label="outer" onClose={() => setOuter(false)}>
          <button type="button" onClick={() => setInner(true)}>
            open inner
          </button>
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setItems((prev) => prev.filter((i) => i !== item))}
            >
              remove {item}
            </button>
          ))}
        </Dialog>
      )}
      {inner && (
        <Dialog label="inner" onClose={() => setInner(false)}>
          <button type="button">inner action</button>
        </Dialog>
      )}
    </>
  );
};

describe("useDialog", () => {
  it("only closes the topmost dialog on Escape and unlocks scroll at the end", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "open outer" }));
    await userEvent.click(screen.getByRole("button", { name: "open inner" }));
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    expect(
      screen.queryByRole("dialog", { name: "inner" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "outer" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("button", { name: "open outer" })).toHaveFocus();
  });

  it("keeps focus inside when the focused control disappears", async () => {
    jest.useFakeTimers();
    try {
      render(<Harness />);
      const user = userEvent;
      act(() => screen.getByRole("button", { name: "open outer" }).click());
      const dialog = screen.getByRole("dialog", { name: "outer" });

      const remove = screen.getByRole("button", { name: "remove a" });
      remove.focus();
      act(() => remove.click());
      act(() => {
        jest.runOnlyPendingTimers();
      });

      expect(dialog).toHaveFocus();
      // Tab from the panel itself goes to its first control, not the page.
      await act(async () => {
        user.tab();
      });
      expect(screen.getByRole("button", { name: "open inner" })).toHaveFocus();
    } finally {
      jest.useRealTimers();
    }
  });

  it("pulls focus back in when it escaped the dialog", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "open outer" }));
    (document.activeElement as HTMLElement).blur();
    expect(document.body).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "remove b" })).toHaveFocus();
  });
});
