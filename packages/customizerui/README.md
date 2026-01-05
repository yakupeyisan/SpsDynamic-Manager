# @customizer/ui

Placeholder texts and UI customization constants for Customizer UI components.

[![npm version](https://badge.fury.io/js/%40customizer%2Fui.svg)](https://badge.fury.io/js/%40customizer%2Fui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @customizer/ui
```

or

```bash
yarn add @customizer/ui
```

or

```bash
pnpm add @customizer/ui
```

## Usage

### Basic Usage

```typescript
import { PLACEHOLDERS, getPlaceholder } from '@customizer/ui';

// Use predefined placeholder
const selectPlaceholder = PLACEHOLDERS.SELECT_OPTION; // "Select an option..."

// Or use the getter function
const searchPlaceholder = getPlaceholder('SEARCH'); // "Search..."
```

### In Angular Components

```typescript
import { Component } from '@angular/core';
import { PLACEHOLDERS } from '@customizer/ui';

@Component({
  selector: 'app-example',
  template: `
    <ui-select [placeholder]="PLACEHOLDERS.SELECT_OPTION"></ui-select>
    <ui-input [placeholder]="PLACEHOLDERS.SEARCH"></ui-input>
  `
})
export class ExampleComponent {
  PLACEHOLDERS = PLACEHOLDERS;
}
```

### TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import { PLACEHOLDERS, PlaceholderKey } from '@customizer/ui';

// Type-safe placeholder keys
const key: PlaceholderKey = 'SELECT_OPTION'; // ✅ Valid
const invalid: PlaceholderKey = 'INVALID'; // ❌ Type error

// Get all placeholders
const allPlaceholders = getAllPlaceholders();
```

## Available Placeholders

| Constant | Value | Description |
|----------|-------|-------------|
| `SELECT_OPTION` | "Select an option..." | Default placeholder for select components |
| `FILTER_OPERATOR` | "Operator" | Filter panel operator field |
| `FILTER_MIN` | "Min" | Minimum value input |
| `FILTER_MAX` | "Max" | Maximum value input |
| `FILTER_SELECT_VALUE` | "Select value" | Single value selection |
| `FILTER_SELECT_VALUES` | "Select values" | Multiple values selection |
| `FILTER_SELECT_DATE` | "Select date" | Date picker input |
| `FILTER_VALUE` | "Value" | Generic value input |
| `FILTER_SELECT_FIELD` | "Select Field" | Field selection dropdown |
| `SEARCH` | "Search..." | Search input placeholder |
| `INPUT_EMPTY` | "" | Empty placeholder |

## API Reference

### `PLACEHOLDERS`

A constant object containing all available placeholder texts.

```typescript
const PLACEHOLDERS: {
  readonly SELECT_OPTION: string;
  readonly FILTER_OPERATOR: string;
  readonly FILTER_MIN: string;
  readonly FILTER_MAX: string;
  readonly FILTER_SELECT_VALUE: string;
  readonly FILTER_SELECT_VALUES: string;
  readonly FILTER_SELECT_DATE: string;
  readonly FILTER_VALUE: string;
  readonly FILTER_SELECT_FIELD: string;
  readonly SEARCH: string;
  readonly INPUT_EMPTY: string;
}
```

### `getPlaceholder(key: PlaceholderKey): string`

Get a placeholder text by its key.

**Parameters:**
- `key`: A valid placeholder key

**Returns:** The placeholder text string

### `getAllPlaceholders(): Readonly<typeof PLACEHOLDERS>`

Get all placeholders as a readonly object.

**Returns:** A readonly copy of the PLACEHOLDERS object

### `PlaceholderKey`

TypeScript type for all valid placeholder keys.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Customizer UI](LICENSE)
