# Sharing and Accessing the Store

## Store Context

Normally we will use store inside the component or hooks.
To reduce the tight coupling between component and the store I prefer to use a component context over passing a props.

We create a context and provider for the components to use, the consumer responsible to set a store for component to functional correctly.

**[Store Context](./1-store-context-example.tsx)**

## Hooks

We create a set of hooks to access the store, attributes and actions.

**[Hooks](./2-store-hooks-example.tsx)**
