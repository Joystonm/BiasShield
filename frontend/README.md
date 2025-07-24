# BiasShield Frontend

BiasShield is a comprehensive platform for fair loan approval prediction with built-in bias detection and mitigation. This frontend application provides an interactive interface for users to interact with the ML model and analyze fairness metrics.

## Advanced Features

### 1. Intersectional Bias Heatmap

The Intersectional Bias Heatmap visualizes how combinations of protected attributes affect model outcomes, revealing potential intersectional biases that may not be apparent when examining attributes in isolation.

**Key capabilities:**
- Interactive selection of attribute combinations (e.g., "Gender + Race", "Race + Age Group")
- Heatmap visualization showing disparities across intersectional groups
- Multiple fairness metrics (approval rate, false positive rate, false negative rate)
- Color-coded visualization to quickly identify problematic areas

### 2. Fairness Remediation Panel

The Fairness Remediation Panel allows users to simulate different bias mitigation strategies and see their impact on fairness metrics in real-time.

**Key capabilities:**
- Interactive selection of protected attributes and fairness metrics
- Multiple remediation strategies (threshold optimization, reweighing, adversarial debiasing)
- Adjustable remediation strength slider
- Side-by-side comparison of original vs. remediated metrics
- Actionable recommendations based on detected bias patterns
- Apply and undo remediation strategies dynamically

### 3. Temporal Bias Tracking

The Temporal Bias Tracking feature monitors how fairness metrics change over time, helping identify if a model gets more biased as it learns from new data.

**Key capabilities:**
- Track fairness metrics over different time periods
- Visualize trends with interactive line charts
- Automated trend analysis (improving, worsening, stable)
- Insights and recommendations based on temporal patterns
- Multiple time range options (month, quarter, year, all time)

## Installation and Setup

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

3. Build for production:
```
npm run build
```

## Dependencies

- React
- Chart.js
- chartjs-chart-matrix (for heatmap visualizations)
- Tailwind CSS (for styling)

## Backend Integration

The frontend communicates with a Python backend that hosts the ML model. The backend provides:

- Loan approval predictions
- SHAP explanations for model decisions
- Fairness metrics calculation
- Bias mitigation algorithms

## Custom ML Implementation

BiasShield uses a custom-trained XGBoost model with fairness constraints built directly into the training process. The model is trained on loan data and optimized for both accuracy and fairness across protected attributes.

Key aspects of the ML implementation:
- Custom loss functions that balance accuracy and fairness
- Adversarial debiasing components
- Fairness-aware feature selection
- Model versioning for comparison
