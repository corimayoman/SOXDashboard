const auth = require('./auth');

async function jiraSearch(jql, fields = ['summary', 'status', 'parent', 'description', 'assignee', 'duedate']) {
  let allIssues = [];
  let nextPageToken = null;
  while (true) {
    const body = { jql, fields };
    if (nextPageToken) body.nextPageToken = nextPageToken;
    const token = await auth.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const cloudId = auth.getCloudId();
    const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Jira API error: ${res.status} ${err}`);
    }
    const data = await res.json();
    allIssues = allIssues.concat(data.issues || []);
    if (!data.nextPageToken) break;
    nextPageToken = data.nextPageToken;
  }
  return allIssues;
}

async function fetchAllData() {
  const project = process.env.JIRA_PROJECT_KEY;

  // Step 1: Find calendar epics
  console.log('Step 1: Finding calendar epics...');
  const epics = await jiraSearch(
    `project = ${project} AND summary ~ "Calendario Controles SOX" AND issuetype = Epic`,
    ['summary', 'status']
  );
  console.log(`Found ${epics.length} epics: ${epics.map(e => e.key).join(', ')}`);
  if (!epics.length) return { subtasks: [], parentMap: new Map() };

  // Step 2: Find all tasks under these epics
  console.log('Step 2: Finding monthly tasks...');
  const epicKeys = epics.map(e => e.key);
  let allTasks = [];
  for (const epicKey of epicKeys) {
    const tasks = await jiraSearch(
      `parent = ${epicKey} AND issuetype = Task`,
      ['summary', 'status', 'duedate', 'description']
    );
    allTasks = allTasks.concat(tasks);
  }
  console.log(`Found ${allTasks.length} monthly tasks`);

  // Step 3: Find all subtasks under these tasks
  console.log('Step 3: Finding control subtasks...');
  let allSubtasks = [];
  for (const task of allTasks) {
    const subtasks = await jiraSearch(
      `parent = ${task.key}`,
      ['summary', 'status', 'parent', 'assignee', 'description']
    );
    allSubtasks = allSubtasks.concat(subtasks);
  }
  console.log(`Found ${allSubtasks.length} control subtasks`);

  // Build parent map (task key → task data)
  const parentMap = new Map();
  for (const task of allTasks) {
    parentMap.set(task.key, task);
  }
  // Also map epic info for platform extraction
  const epicMap = new Map();
  for (const epic of epics) {
    epicMap.set(epic.key, epic);
  }
  // Enrich tasks with their epic info
  for (const task of allTasks) {
    const epicKey = epicKeys.find(ek => {
      // We know which epic each task belongs to from the query
      return true; // We'll parse platform from task summary instead
    });
  }

  return { subtasks: allSubtasks, parentMap };
}

module.exports = { fetchAllData, jiraSearch };
