# Shared UI Component Library Usage Guide

All UI components can be imported cleanly from the library index file:

```javascript
import { Button, Input, Select, Badge, Modal } from '../components/ui';
```

### Quick Usage Examples

#### 1. Form Inputs (For Registration, Login, and Bid Forms)
```jsx
<Input 
  label="Quoted Price (KSH)" 
  type="number" 
  placeholder="Enter bid amount" 
  error={errors.price} 
/>
```

#### 2. Dynamic Status Badges (For Evaluation and Fraud Monitoring)
```jsx
<Badge variant="danger">High Fraud Risk</Badge>
<Badge variant="success">Awarded</Badge>
<Badge variant="warning">In Review</Badge>
```

#### 3. Buttons with Loading Spinners
```jsx
<Button type="submit" variant="primary" isLoading={isSubmitting}>
  Submit Tender
</Button>
```
