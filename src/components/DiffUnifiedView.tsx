import { useEffect } from "react";
import type { DiffBlock } from "../types/diff";

interface DiffUnifiedViewProps {
  blocks: DiffBlock[];
  activeAnchorId?: string;
}

export function DiffUnifiedView({
  blocks,
  activeAnchorId,
}: DiffUnifiedViewProps) {
  useEffect(() => {
    if (!activeAnchorId) {
      return;
    }
    const anchor = document.getElementById(activeAnchorId);
    anchor?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeAnchorId]);

  return (
    <div className="diff-unified" aria-label="Unified diff view">
      {blocks.map((block) => (
        <section
          key={block.id}
          id={block.anchorId}
          className="diff-block"
          data-active={activeAnchorId === block.anchorId}
        >
          {block.lines.map((line) => {
            if (line.changeKind === "context") {
              return (
                <div key={line.id} className="diff-row diff-row-context">
                  <span className="diff-line-number">
                    {line.leftLineNumber ?? ""}
                  </span>
                  <span className="diff-line-number">
                    {line.rightLineNumber ?? ""}
                  </span>
                  <code className="diff-code">
                    {line.leftTokens.map((token, index) => (
                      <span
                        key={`${line.id}-context-${index}`}
                        className={`token-${token.type}`}
                      >
                        {token.value}
                      </span>
                    ))}
                  </code>
                </div>
              );
            }

            return (
              <div key={line.id} className="diff-unified-change">
                {line.leftType !== "empty" && (
                  <div className={`diff-row diff-row-${line.leftType}`}>
                    <span className="diff-line-number">
                      {line.leftLineNumber ?? ""}
                    </span>
                    <span className="diff-line-number" />
                    <code className="diff-code">
                      {line.leftTokens.map((token, index) => (
                        <span
                          key={`${line.id}-left-${index}`}
                          className={`token-${token.type}`}
                        >
                          {token.value}
                        </span>
                      ))}
                    </code>
                  </div>
                )}
                {line.rightType !== "empty" && (
                  <div className={`diff-row diff-row-${line.rightType}`}>
                    <span className="diff-line-number" />
                    <span className="diff-line-number">
                      {line.rightLineNumber ?? ""}
                    </span>
                    <code className="diff-code">
                      {line.rightTokens.map((token, index) => (
                        <span
                          key={`${line.id}-right-${index}`}
                          className={`token-${token.type}`}
                        >
                          {token.value}
                        </span>
                      ))}
                    </code>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
