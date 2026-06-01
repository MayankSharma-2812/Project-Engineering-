// run-tests.js — Fire 5 test calls with different DSA problems

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLW1heWFuay0wMSIsImVtYWlsIjoibWF5YW5rQGV4YW1wbGUuY29tIiwiaWF0IjoxNzgwMjU3OTcwfQ.wTTDrNIJ1l11etjghVEZEZjxxK20zQbU5JnpAqzaYTM';
const BASE = 'http://localhost:3000';

const tests = [
  {
    label: 'Two Sum (short JS)',
    body: {
      problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      solution: 'function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i+1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n}',
      language: 'javascript'
    }
  },
  {
    label: 'Merge Sort (medium Python)',
    body: {
      problemStatement: 'Implement merge sort algorithm to sort an array of integers in ascending order.',
      solution: 'def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result',
      language: 'python'
    }
  },
  {
    label: 'BFS Graph (long JS)',
    body: {
      problemStatement: 'Given a graph represented as an adjacency list, implement Breadth-First Search (BFS) starting from a given source node. Return the order in which nodes are visited.',
      solution: 'function bfs(graph, start) {\n  const visited = new Set();\n  const queue = [start];\n  const order = [];\n  visited.add(start);\n  while (queue.length > 0) {\n    const node = queue.shift();\n    order.push(node);\n    for (const neighbor of graph[node] || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return order;\n}\n\n// Build adjacency list from edge pairs\nfunction buildGraph(edges) {\n  const graph = {};\n  for (const [u, v] of edges) {\n    if (!graph[u]) graph[u] = [];\n    if (!graph[v]) graph[v] = [];\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  return graph;\n}\n\nconst edges = [[0,1],[0,2],[1,3],[2,4],[3,5]];\nconst graph = buildGraph(edges);\nconsole.log(bfs(graph, 0));',
      language: 'javascript'
    }
  },
  {
    label: 'Binary Search (Java)',
    body: {
      problemStatement: 'Given a sorted array of integers and a target value, return the index of the target if found, otherwise return -1. Implement using binary search.',
      solution: 'public class Solution {\n    public static int binarySearch(int[] arr, int target) {\n        int left = 0;\n        int right = arr.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (arr[mid] == target) return mid;\n            else if (arr[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}',
      language: 'java'
    }
  },
  {
    label: 'LRU Cache (Python)',
    body: {
      problemStatement: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods that run in O(1) time.',
      solution: 'class Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.cache = {}\n        self.head = Node()\n        self.tail = Node()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key):\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_to_front(node)\n        return node.val\n\n    def put(self, key, value):\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_to_front(node)\n        if len(self.cache) > self.cap:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.cache[lru.key]',
      language: 'python'
    }
  }
];

async function runTest(test, i) {
  const res = await fetch(`${BASE}/api/review-solution`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(test.body)
  });
  const data = await res.json();
  console.log(`\n--- Test ${i+1}: ${test.label} ---`);
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

(async () => {
  for (let i = 0; i < tests.length; i++) {
    await runTest(tests[i], i);
  }
  console.log('\n✅ All 5 test calls completed.');
})();
