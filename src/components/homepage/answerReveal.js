// Parse the complete Markdown first, then assign reveal steps to its rendered tree.
export function rehypeAnswerReveal() {
  return tree => {
    let step = 0;

    function annotate(parent) {
      parent.children = parent.children.flatMap(node => {
        if (node.type === "text" && node.value.trim()) {
          return node.value.match(/\s*\S+\s*|\s+/gu).map(value => ({
            type: "element",
            tagName: "span",
            properties: { dataAnswerStep: ++step },
            children: [{ type: "text", value }],
          }));
        }

        if (node.type === "element") {
          const start = step + 1;
          annotate(node);
          // Elements such as a line break or rule have no words of their own.
          if (step < start) step = start;
          node.properties.dataAnswerStep = start;
        }

        return node;
      });
    }

    annotate(tree);
  };
}
