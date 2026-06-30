function splitStrongText(value) {
  const parts = [];
  const strongPattern = /\*\*([^*\n]+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = strongPattern.exec(value)) !== null) {
    const [raw, content] = match;

    if (content.trim().length === 0) {
      continue;
    }

    if (match.index > lastIndex) {
      parts.push({type: 'text', value: value.slice(lastIndex, match.index)});
    }

    parts.push({
      type: 'strong',
      children: [{type: 'text', value: content}],
    });

    lastIndex = match.index + raw.length;
  }

  if (parts.length === 0) {
    return null;
  }

  if (lastIndex < value.length) {
    parts.push({type: 'text', value: value.slice(lastIndex)});
  }

  return parts;
}

function transformChildren(node) {
  if (!Array.isArray(node.children)) {
    return;
  }

  const children = [];

  for (const child of node.children) {
    if (child.type === 'text' && child.value.includes('**')) {
      const split = splitStrongText(child.value);
      children.push(...(split ?? [child]));
      continue;
    }

    transformChildren(child);
    children.push(child);
  }

  node.children = children;
}

export default function remarkStrongInline() {
  return (tree) => {
    transformChildren(tree);
  };
}
