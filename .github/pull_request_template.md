1. Task: [React project setup. Class components. Error boundary](https://github.com/rolling-scopes-school/tasks/blob/master/react/modules/tasks/class-components.md)
2. Screenshot:![img.png](img.png)
3. Deploy: [link](https://rolling-scopes-school.github.io/ivan-khodorov-REACT2026Q2/)
4. Done 05.05.2026 / deadline 05.05.2026
5. Score: 100 / 100
- [x] Application layout structure: the page contains exactly two main sections, search area at the top and       
  results area at the bottom. (5/5)
- [x] Search functionality with local storage: search input loads the previous search term from localStorage or   
  stays empty if there is no saved term. (15/15)
- [x] Search results display: results are shown in the results section, each item displays name and description.  
  (10/10)
- [x] Initial data load: on app load, the first page is fetched using the saved search term or all items if no    
  term exists. (10/10)
- [x] Search execution: search trims spaces, skips unchanged text, fetches the first page, includes the search    
  term, and updates results. (20/20)
- [x] Search term persistence: changed trimmed search term is saved to localStorage and replaces the previous     
  value. (5/5)
- [x] Loading state indication: loader is displayed during API requests and hidden after completion. (10/10)
- [x] Error handling: API 4xx/5xx errors show a readable message without uncaught errors or unnecessary console   
  logs. (10/10)
- [x] Application Error Boundary: test button triggers an application error, ErrorBoundary logs it to console and
  shows fallback UI. (15/15)    