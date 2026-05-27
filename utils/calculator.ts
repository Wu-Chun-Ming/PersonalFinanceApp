const ALLOWED_EXPRESSION = /^[0-9+\-*/().\s]+$/;

const TRAILING_OPERATOR = /[+\-*/.x÷]$/;
const OPERATOR_KEYS = new Set(['+', '-', 'x', '÷', '*', '/']);
const CONTROL_KEYS = new Set(['C', '⌫', '=']);

const normalizePercent = (expression: string) =>
  expression.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

const trimTrailingOperators = (expression: string) =>
  expression.replace(TRAILING_OPERATOR, '');

const formatResult = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const rounded = Number(value.toFixed(10));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

const getCurrentOperand = (expression: string) => {
  const segments = expression.split(/[+\-*/]/);
  return segments[segments.length - 1] ?? '';
};

const appendDigit = (expression: string, digit: string) => {
  if (expression === '0') {
    return digit;
  }

  return `${expression}${digit}`;
};

const appendDecimal = (expression: string) => {
  const currentOperand = getCurrentOperand(expression);

  if (currentOperand.includes('.')) {
    return expression;
  }

  if (!expression || OPERATOR_KEYS.has(expression.slice(-1))) {
    return `${expression || '0'}.`;
  }

  return `${expression}.`;
};

const appendOperator = (expression: string, operator: string) => {
  if (!expression || expression === '0') {
    if (operator === '-') {
      return '-';
    }

    // If there's no meaningful operand yet, start from 0 and append operator
    const base = expression && expression !== '0' ? expression : '0';
    return `${base}${operator}`;
  }

  if (OPERATOR_KEYS.has(expression.slice(-1))) {
    return `${expression.slice(0, -1)}${operator}`;
  }

  return `${expression}${operator}`;
};

const appendPercent = (expression: string) => {
  if (
    !expression ||
    OPERATOR_KEYS.has(expression.slice(-1)) ||
    expression === '0'
  ) {
    return expression;
  }

  if (expression.endsWith('%')) {
    return expression;
  }

  return `${expression}%`;
};

export const evaluateCalculatorExpression = (expression: string) => {
  const trimmedExpression = trimTrailingOperators(expression.trim());

  if (!trimmedExpression) {
    return '0';
  }

  const normalizedExpression = normalizePercent(
    trimmedExpression.replace(/x/g, '*').replace(/÷/g, '/'),
  );

  if (!ALLOWED_EXPRESSION.test(normalizedExpression)) {
    return '0';
  }

  try {
    const result = Function(
      `"use strict"; return (${normalizedExpression});`,
    )();
    return formatResult(Number(result));
  } catch {
    return '0';
  }
};

export const applyCalculatorKey = (expression: string, key: string) => {
  if (CONTROL_KEYS.has(key)) {
    if (key === 'C') {
      return '0';
    }

    if (key === '⌫') {
      if (expression.length <= 1) {
        return '0';
      }

      const nextExpression = expression.slice(0, -1);
      return nextExpression.length === 0 ? '0' : nextExpression;
    }

    return evaluateCalculatorExpression(expression);
  }

  if (key === '.') {
    return appendDecimal(expression);
  }

  if (key === '%') {
    return appendPercent(expression);
  }

  if (OPERATOR_KEYS.has(key)) {
    return appendOperator(expression, key);
  }

  if (/^\d$/.test(key)) {
    return appendDigit(expression, key);
  }

  return expression;
};
