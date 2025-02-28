# react-branch-list

`react-branch-list` is a high-performance list component based on a binary tree structure, designed to optimize rendering efficiency in React. Unlike the traditional map approach, which triggers full list re-renders, this component performs localized updates when items are added, removed, or moved, significantly reducing React Fiber overhead.

## 🎯 Why Use react-branch-list?

### ❌ The Problem with Traditional map Rendering

In React, lists are typically rendered using:

```tsx
list.map((i) => <ItemComponent key={i.id} {...i} />);
```

However, when items are added, removed, or reordered, React reconciles the entire list, causing unnecessary re-renders and increasing Fiber computation costs, especially in complex UI structures.

### The react-branch-list Optimization

- Efficient Updates – Only updates affected nodes instead of re-rendering the entire list.

## 📖 Usage

```tsx
import React from 'react';

import { BranchList, IBranchListRef, IBranchListItem } from 'react-branch-list';

type ContentType = { content: string };

const ItemComponent: React.FC<IBranchListItem<ContentType>> = ({ id, content }) => {
  return <div data-id={id}>{content}</div>;
};

export const BranchListDemo: React.FC = () => {
  const provider = React.useRef<IBranchListRef<ContentType> | null>(null);

  return (
    <BranchList
      ref={provider}
      className="branch-list"
      direction="column"
      renderComponent={ItemComponent}
      defaultItems={new Array(5).fill(1).map((_, index) => {
        return {
          id: `node-${index}`,
          content: `content-${index}`,
        };
      })}
    />
  );
};
```
