let next = 1;

export function nextId(prefix = 'id'): string {
  const id = `${prefix}-${next}`;
  next += 1;
  return id;
}

