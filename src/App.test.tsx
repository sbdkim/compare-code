import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("@uiw/react-codemirror", () => ({
  default: ({
    value,
    onChange,
    "aria-label": ariaLabel,
  }: {
    value: string;
    onChange: (value: string) => void;
    "aria-label": string;
  }) => (
    <textarea
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe("App", () => {
  let clipboardWriteText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage.clear();
    clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("swaps pane content", async () => {
    const user = userEvent.setup();
    render(<App />);

    const left = screen.getByLabelText("Original");
    const right = screen.getByLabelText("Modified");
    const leftValue = (left as HTMLTextAreaElement).value;
    const rightValue = (right as HTMLTextAreaElement).value;

    await user.click(screen.getByRole("button", { name: "Swap" }));

    expect((left as HTMLTextAreaElement).value).toBe(rightValue);
    expect((right as HTMLTextAreaElement).value).toBe(leftValue);
  });

  it("clears editors and resets persisted state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect((screen.getByLabelText("Original") as HTMLTextAreaElement).value).toBe("");
    expect((screen.getByLabelText("Modified") as HTMLTextAreaElement).value).toBe("");
    expect(window.localStorage.getItem("code-compare-session")).toContain('"leftText":""');
  });

  it("persists the Northline light theme", () => {
    render(<App />);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("code-compare-session")).toContain('"theme":"light"');
  });

  it("copies unified diff output", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Copy diff" }));

    await waitFor(() => {
      expect(screen.getByText("Copied diff output")).toBeInTheDocument();
    });
  });

  it("imports supported files", async () => {
    render(<App />);

    const input = document.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;
    const file = new File(["console.log('hello')"], "sample.js", {
      type: "text/javascript",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect((screen.getByLabelText("Original") as HTMLTextAreaElement).value).toContain(
        "console.log",
      );
    });
  });
});
