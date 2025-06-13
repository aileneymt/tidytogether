const LOW = 'low';
const URGENT = 'urgent';
const DEFAULT = 'default'

const PRIORITIES = [DEFAULT, LOW, URGENT];

const PRIORITY_MAP = {
  1: [DEFAULT],
  2: [URGENT],
  3: [LOW]
}

export { PRIORITIES, LOW, URGENT, DEFAULT, PRIORITY_MAP }