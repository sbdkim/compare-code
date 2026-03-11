import { useEffect, useRef } from "react";
import type { DiffBlock } from "../types/diff";

interface DiffSideBySideViewProps {
  blocks: DiffBlock[];
  activeAnchorId?: string;
}

export function DiffSideBySideView({
  blocks,
  activeAnchorId,
}: DiffSideBySideViewProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef<"left" | "right" | null>(null);

  useEffect(() => {
    const leftNode = leftRef.current;
    const rightNode = rightRef.current;
    if (!leftNode || !rightNode) {
      return;
    }

    const sync = (source: "left" | "right") => {
      const sourceNode = source === "left" ? leftNode : rightNode;
      const targetNode = source === "left" ? rightNode : leftNode;
      if (syncingRef.current && syncingRef.current !== source) {
        return;
      }
      syncingRef.current = source;
      targetNode.scrollTop = sourceNode.scrollTop;
      requestAnimationFrame(() => {
        syncingRef.current = null;
      });
    };

    const onLeftScroll = () => sync("left");
    const onRightScroll = () => sync("right");
    leftNode.addEventListener("scroll", onLeftScroll, { passive: true });
    rightNode.addEventListener("scroll", onRightScroll, { passive: true });

    return () => {
      leftNode.removeEventListener("scroll", onLeftScroll);
      rightNode.removeEventListener("scroll", onRightScroll);
    };
  }, []);

  useEffect(() => {
    if (!activeAnchorId) {
      return;
    }
    const anchor = document.getElementById(activeAnchorId);
    anchor?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeAnchorId]);

  return (
    <div className="diff-side-by-side">
      <div ref={leftRef} className="diff-pane" aria-label="Original diff pane">
        {blocks.map((block) => (
          <div
            key={`${block.id}-left`}
            id={block.anchorId}
            className="diff-block"
            data-active={activeAnchorId === block.anchorId}
          >
            {block.lines.map((line) => (
              <div
                key={`${line.id}-left`}
                className={`diff-row diff-row-${line.leftType}`}
              >
                <span className="diff-line-number">
                  {line.leftLineNumber ?? ""}
                </span>
                <code className="diff-code">
                  {line.leftTokens.map((token, index) => (
                    <span
                      key={`${line.id}-left-token-${index}`}
                      className={`token-${token.type}`}
                    >
                      {token.value || " "}
                    </span>
                  ))}
                </code>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={rightRef} className="diff-pane" aria-label="Modified diff pane">
        {blocks.map((block) => (
          <div
            key={`${block.id}-right`}
            className="diff-block"
            data-active={activeAnchorId === block.anchorId}
          >
            {block.lines.map((line) => (
              <div
                key={`${line.id}-right`}
                className={`diff-row diff-row-${line.rightType}`}
              >
                <span className="diff-line-number">
                  {line.rightLineNumber ?? ""}
                </span>
                <code className="diff-code">
                  {line.rightTokens.map((token, index) => (
                    <span
                      key={`${line.id}-right-token-${index}`}
                      className={`token-${token.type}`}
                    >
                      {token.value || " "}
                    </span>
                  ))}
                </code>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
