# LoadUp MCP Tools Guide

This guide provides instructions for using Model Context Protocol (MCP) tools with the LoadUp project, including GitHub integration, browser tools, and sequential thinking.

## Browser Tools MCP

The Browser Tools MCP enables AI-powered applications to capture and analyze browser data through a Chrome extension, making your AI tools more aware and capable of interacting with your browser.

### Setup Instructions

1. **Install the Browser Tools MCP package**:
   ```bash
   npm install -g @agentdeskai/browser-tools-mcp@1.2.0
   npm install -g @agentdeskai/browser-tools-server@1.2.0
   ```

2. **Install the Chrome Extension**:
   - Download the latest version from: [BrowserTools Chrome Extension](https://github.com/AgentDeskAI/browser-tools-mcp/releases/download/v1.2.0/BrowserTools-1.2.0-extension.zip)
   - Unzip the file
   - Open Chrome and go to `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the unzipped folder

3. **Start the Browser Tools Server**:
   ```bash
   npx @agentdeskai/browser-tools-server@1.2.0
   ```

### Available Browser Tools

1. **Console Logs**: View browser console logs
   ```javascript
   mcp__getConsoleLogs({ random_string: "any" })
   ```

2. **Console Errors**: View browser console errors
   ```javascript
   mcp__getConsoleErrors({ random_string: "any" })
   ```

3. **Network Logs**: View network requests
   ```javascript
   mcp__getNetworkLogs({ random_string: "any" })
   ```

4. **Network Errors**: View network errors
   ```javascript
   mcp__getNetworkErrors({ random_string: "any" })
   ```

5. **Screenshots**: Take screenshots of the current browser tab
   ```javascript
   mcp__takeScreenshot({ random_string: "any" })
   ```

6. **Audits**: Run various audits on the current page
   ```javascript
   mcp__runAccessibilityAudit({ random_string: "any" })
   mcp__runPerformanceAudit({ random_string: "any" })
   mcp__runSEOAudit({ random_string: "any" })
   mcp__runBestPracticesAudit({ random_string: "any" })
   mcp__runNextJSAudit({ random_string: "any" })
   ```

7. **Debug Mode**: Run debugger mode to debug issues
   ```javascript
   mcp__runDebuggerMode({ random_string: "any" })
   ```

8. **Audit Mode**: Run audit mode to optimize for SEO, accessibility, and performance
   ```javascript
   mcp__runAuditMode({ random_string: "any" })
   ```

## Sequential Thinking MCP (Big Think)

The Sequential Thinking MCP (also known as "Big Think") from Smithery.ai provides a powerful framework for dynamic and reflective problem-solving through a structured thinking process. This tool is particularly valuable for logistics applications like LoadUp that require complex decision-making and optimization.

### What is Sequential Thinking/Big Think?

Sequential Thinking is a methodical approach to problem-solving that breaks down complex problems into manageable steps, allowing for:

- **Dynamic Reflection**: The ability to revise previous thoughts as understanding deepens
- **Structured Analysis**: A step-by-step approach to complex problems
- **Hypothesis Generation and Testing**: Creating and validating potential solutions
- **Branching Logic**: Exploring multiple solution paths when appropriate
- **Iterative Refinement**: Continuously improving solutions through feedback

### Setup Instructions

1. **Access via Smithery.ai**:
   - Visit [Smithery.ai Sequential Thinking](https://smithery.ai/server/@smithery-ai/server-sequential-thinking)
   - Follow the installation instructions for your specific environment

2. **Manual Configuration**:
   Add the following to your Cursor configuration:
   ```json
   {
     "mcpServers": {
       "sequential-thinking": {
         "command": "npx",
         "args": [
           "-y",
           "@smithery-ai/server-sequential-thinking"
         ]
       }
     }
   }
   ```

### Using Sequential Thinking/Big Think

The Sequential Thinking tool can be invoked using the `mcp__sequentialthinking` function with the following parameters:

```javascript
mcp__sequentialthinking({
  thought: "Your current thinking step",
  nextThoughtNeeded: true, // Set to false when analysis is complete
  thoughtNumber: 1, // Current step in the sequence
  totalThoughts: 5, // Estimated total steps needed
  isRevision: false, // Set to true when revising previous thoughts
  revisesThought: null, // Which thought is being reconsidered
  branchFromThought: null, // Branching point thought number
  branchId: null, // Identifier for the current branch
  needsMoreThoughts: false // Set to true if more thoughts are needed
})
```

#### Example: Route Optimization Problem

```javascript
// Step 1: Define the problem
mcp__sequentialthinking({
  thought: "We need to optimize delivery routes for 15 packages across the city with 3 available drivers, considering time windows, vehicle capacity, and traffic patterns.",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 5
})

// Step 2: Break down the problem
mcp__sequentialthinking({
  thought: "Let's break this down into components: (1) Driver availability and constraints, (2) Package delivery windows, (3) Geographic clustering, (4) Traffic patterns, (5) Vehicle capacity limitations.",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 5
})

// Step 3: Analyze components
mcp__sequentialthinking({
  thought: "For geographic clustering, we should group packages by proximity using a k-means algorithm with k=3 (number of drivers). This will create initial clusters that minimize total travel distance.",
  nextThoughtNeeded: true,
  thoughtNumber: 3,
  totalThoughts: 5
})

// Step 4: Revise previous thinking
mcp__sequentialthinking({
  thought: "Actually, pure k-means clustering won't account for time windows. We need to use a constrained clustering approach that considers both location and delivery time windows.",
  nextThoughtNeeded: true,
  thoughtNumber: 4,
  totalThoughts: 5,
  isRevision: true,
  revisesThought: 3
})

// Step 5: Propose solution
mcp__sequentialthinking({
  thought: "The optimal approach is a two-phase algorithm: (1) Initial clustering based on geographic proximity and time windows, (2) Route optimization within each cluster using a modified Vehicle Routing Problem (VRP) solver that accounts for traffic patterns.",
  nextThoughtNeeded: false,
  thoughtNumber: 5,
  totalThoughts: 5
})
```

### Advanced Features

1. **Branching Logic**:
   When multiple solution paths need exploration, use the branching parameters:
   ```javascript
   mcp__sequentialthinking({
     thought: "Let's explore an alternative approach using dynamic programming instead of VRP.",
     nextThoughtNeeded: true,
     thoughtNumber: 6,
     totalThoughts: 8,
     branchFromThought: 4,
     branchId: "dynamic-programming"
   })
   ```

2. **Extending Analysis**:
   If you reach the end but need more analysis:
   ```javascript
   mcp__sequentialthinking({
     thought: "We need to consider driver breaks and rest periods in our optimization.",
     nextThoughtNeeded: true,
     thoughtNumber: 5,
     totalThoughts: 7,
     needsMoreThoughts: true
   })
   ```

3. **Hypothesis Verification**:
   Test solutions against criteria:
   ```javascript
   mcp__sequentialthinking({
     thought: "Verifying our solution against historical delivery data shows a potential 23% reduction in total travel time.",
     nextThoughtNeeded: true,
     thoughtNumber: 6,
     totalThoughts: 7
   })
   ```

### Benefits for LoadUp

1. **Structured Problem-Solving**: Helps break down complex logistics problems into manageable steps
2. **Route Optimization**: Assists in analyzing multiple factors for optimal delivery routes
3. **Decision Making**: Provides a framework for evaluating shipment prioritization
4. **Process Improvement**: Helps identify bottlenecks in logistics workflows
5. **Transparent Reasoning**: Documents the thought process for important decisions

### Use Cases in LoadUp

1. **Delivery Route Planning**:
   - Analyze traffic patterns, delivery windows, and vehicle capacity
   - Optimize multi-stop routes for fuel efficiency and on-time delivery
   - Handle dynamic rerouting when conditions change

2. **Warehouse Optimization**:
   - Determine optimal storage locations for different types of shipments
   - Plan picking routes to minimize worker travel time
   - Balance workload across warehouse zones

3. **Driver Assignment**:
   - Match drivers to shipments based on location, vehicle type, and schedule
   - Consider driver skills, certifications, and preferences
   - Optimize for driver satisfaction and retention

4. **Exception Handling**:
   - Develop structured approaches to delivery exceptions and delays
   - Create contingency plans for various failure scenarios
   - Analyze root causes of recurring issues

5. **Capacity Planning**:
   - Forecast resource needs based on historical data and trends
   - Plan for seasonal variations in demand
   - Optimize fleet composition and size

### Integration with Other MCP Tools

Sequential Thinking works well with other MCP tools:

1. **GitHub Integration**: Use Sequential Thinking to plan code changes, then implement them with GitHub tools
2. **Browser Tools**: Analyze web application issues with Sequential Thinking, then verify fixes with Browser Tools
3. **Database Tools**: Design database queries and optimizations with Sequential Thinking before implementation

### Best Practices

1. **Start with Clear Problem Definition**:
   - Be specific about the problem you're trying to solve
   - Define success criteria and constraints

2. **Break Down Complex Problems**:
   - Divide large problems into manageable components
   - Analyze each component systematically

3. **Revise Freely**:
   - Don't hesitate to revise earlier thoughts as understanding improves
   - Use the revision parameters to track changes in thinking

4. **Document Decision Processes**:
   - Use Sequential Thinking to document important decisions
   - Create a record of reasoning for future reference

5. **Combine with Domain Knowledge**:
   - Apply logistics-specific knowledge to the thinking process
   - Incorporate industry best practices and constraints

## GitHub Integration MCP

The GitHub Integration MCP allows you to interact with GitHub repositories directly from your AI assistant.

### Repository Management

1. **Create a New Repository**:
   ```javascript
   mcp__create_repository({
     name: "loadup-logistics",
     description: "A full-stack logistics application for tracking shipments and deliveries",
     private: false,
     autoInit: true
   });
   ```

2. **Fork a Repository**:
   ```javascript
   mcp__fork_repository({
     owner: "original-owner",
     repo: "loadup-template"
   });
   ```

### File Management

1. **Create or Update a File**:
   ```javascript
   mcp__create_or_update_file({
     owner: "your-username",
     repo: "loadup-logistics",
     path: "README.md",
     content: "# LoadUp Logistics\n\nA full-stack logistics application for tracking shipments and deliveries.",
     message: "Update README with project description",
     branch: "main"
   });
   ```

2. **Push Multiple Files**:
   ```javascript
   mcp__push_files({
     owner: "your-username",
     repo: "loadup-logistics",
     branch: "main",
     message: "Add initial project structure",
     files: [
       {
         path: "package.json",
         content: "{ ... }"
       },
       {
         path: "turbo.json",
         content: "{ ... }"
       }
     ]
   });
   ```

3. **Get File Contents**:
   ```javascript
   mcp__get_file_contents({
     owner: "your-username",
     repo: "loadup-logistics",
     path: "README.md"
   });
   ```

### Issue Management

1. **Create an Issue**:
   ```javascript
   mcp__create_issue({
     owner: "your-username",
     repo: "loadup-logistics",
     title: "Implement real-time shipment tracking with Mapbox",
     body: "We need to integrate Mapbox for real-time shipment tracking in the driver app and admin dashboard.",
     labels: ["enhancement", "frontend"]
   });
   ```

2. **List Issues**:
   ```javascript
   mcp__list_issues({
     owner: "your-username",
     repo: "loadup-logistics",
     state: "open"
   });
   ```

### Pull Request Management

1. **Create a Pull Request**:
   ```javascript
   mcp__create_pull_request({
     owner: "your-username",
     repo: "loadup-logistics",
     title: "Implement Mapbox integration",
     body: "This PR adds Mapbox integration for real-time shipment tracking.",
     head: "feature/mapbox-integration",
     base: "main"
   });
   ```

### Search Functionality

1. **Search Repositories**:
   ```javascript
   mcp__search_repositories({
     query: "logistics tracking shipment"
   });
   ```

2. **Search Code**:
   ```javascript
   mcp__search_code({
     q: "mapbox tracking in:file language:typescript"
   });
   ```

3. **Search Issues**:
   ```javascript
   mcp__search_issues({
     q: "clerk authentication in:title,body is:issue state:open"
   });
   ```

## Best Practices

1. **GitHub Integration**:
   - Use clear, descriptive commit messages
   - Use feature branches for new features and bug fixes
   - Create pull requests for code reviews
   - Use issues to track bugs, features, and tasks
   - Keep documentation up-to-date with code changes

2. **Browser Tools**:
   - Use the browser tools to debug issues in the LoadUp web applications
   - Run audits to optimize performance, accessibility, and SEO
   - Use screenshots to capture UI issues
   - Monitor network requests for API issues
   - Check console logs for JavaScript errors

3. **Sequential Thinking**:
   - Break down complex logistics problems into clear steps
   - Document decision-making processes for future reference
   - Use structured thinking for route optimization and delivery planning
   - Apply sequential analysis to identify bottlenecks in the logistics workflow
   - Combine with domain expertise for best results
   - Use branching to explore multiple solution paths when appropriate
   - Revise earlier thoughts as new information becomes available

## Cursor Settings for MCP Tools

To enable MCP tools in Cursor, add the following to your Cursor settings:

```json
{
  "ai.experimental.mcpTools": true,
  "ai.mcpTools.browserTools": true,
  "ai.mcpTools.github": true,
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery-ai/server-sequential-thinking"
      ]
    }
  }
}
```

## LoadUp Development SOP with MCP Tools

This Standard Operating Procedure (SOP) outlines how to effectively use Model Context Protocol (MCP) tools for the LoadUp logistics application development process. By leveraging these tools, we can significantly enhance our development workflow, improve code quality, and accelerate delivery.

### 1. Development Workflow Overview

#### Initial Planning Phase
1. **Sequential Thinking Analysis**
   - Use Sequential Thinking MCP to break down complex logistics problems
   - Document decision-making processes for future reference
   - Generate structured solutions for implementation

2. **GitHub Repository Management**
   - Use GitHub Integration MCP for repository setup and management
   - Create feature branches for new development
   - Track issues and milestones

#### Development Phase
1. **UI Component Creation**
   - Use 21st Magic Component Builder MCP for rapid UI development
   - Generate logistics-specific components with natural language
   - Customize generated components to match LoadUp design system

2. **Database Operations**
   - Use Supabase MCP for database schema design and queries
   - Test database operations with natural language commands
   - Optimize database performance for logistics operations

3. **Browser Testing & Debugging**
   - Use Browser Tools MCP for real-time debugging
   - Run performance and accessibility audits
   - Capture and analyze network requests

#### Testing & Deployment Phase
1. **Comprehensive Testing**
   - Use Browser Tools MCP for automated testing
   - Document test results and issues
   - Fix identified issues before deployment

2. **Deployment Management**
   - Use GitHub Integration MCP for deployment automation
   - Track deployment status and issues
   - Roll back if necessary

### 2. Sequential Thinking MCP Usage

#### When to Use
- Complex logistics algorithm design (route optimization, driver assignment)
- Decision-making processes that require structured analysis
- Problem-solving that benefits from step-by-step reasoning

#### Process
1. **Define the Problem**
   ```javascript
   mcp__sequentialthinking({
     thought: "Define the specific logistics problem we need to solve",
     nextThoughtNeeded: true,
     thoughtNumber: 1,
     totalThoughts: 5
   })
   ```

2. **Break Down Components**
   ```javascript
   mcp__sequentialthinking({
     thought: "Break down the problem into manageable components",
     nextThoughtNeeded: true,
     thoughtNumber: 2,
     totalThoughts: 5
   })
   ```

3. **Analyze Solutions**
   ```javascript
   mcp__sequentialthinking({
     thought: "Analyze potential solutions for each component",
     nextThoughtNeeded: true,
     thoughtNumber: 3,
     totalThoughts: 5
   })
   ```

4. **Evaluate Trade-offs**
   ```javascript
   mcp__sequentialthinking({
     thought: "Evaluate trade-offs between different approaches",
     nextThoughtNeeded: true,
     thoughtNumber: 4,
     totalThoughts: 5
   })
   ```

5. **Propose Implementation**
   ```javascript
   mcp__sequentialthinking({
     thought: "Propose specific implementation details",
     nextThoughtNeeded: false,
     thoughtNumber: 5,
     totalThoughts: 5
   })
   ```

### 3. 21st Magic Component Builder MCP Usage

#### What It Is
The 21st Magic Component Builder MCP is an AI-powered tool that generates high-quality UI components from natural language descriptions. It's particularly useful for rapidly creating modern, responsive UI elements for the LoadUp application.

#### Setup Instructions
```bash
npx -y @smithery/cli@latest run @21st-dev/magic-mcp
```

#### When to Use
- Creating new UI components for the LoadUp dashboard
- Building responsive interfaces for the driver app
- Generating form components for shipment processing
- Creating data visualization components for logistics analytics

#### Process
1. **Describe the Component**
   - Use the `/ui` command followed by a detailed description
   - Example: `/ui create a shipment tracking card with status indicator, delivery time, and map preview`

2. **Review Generated Component**
   - Examine the code for the generated component
   - Ensure it follows LoadUp design guidelines

3. **Customize as Needed**
   - Modify the component to match specific requirements
   - Integrate with LoadUp state management (Zustand)

4. **Integration**
   - Add the component to the appropriate location in the codebase
   - Test for responsiveness and functionality

#### Example Usage
```javascript
mcp__21st_magic_component_builder({
  message: "Create a responsive shipment card component that shows the shipment ID, status, delivery time, and has a button to view details",
  searchQuery: "shipment card component"
})
```

### 4. Supabase MCP Usage

#### What It Is
The Supabase MCP allows direct interaction with our PostgreSQL database through natural language. It enables database operations, schema design, and query optimization without writing raw SQL.

#### Setup Instructions
```bash
npx -y @modelcontextprotocol/server-postgres <connection-string>
```

#### When to Use
- Database schema design for logistics entities
- Creating and optimizing queries for shipment data
- Testing database operations
- Analyzing database performance

#### Process
1. **Connect to Database**
   - Ensure the Supabase MCP is properly configured with connection string
   - Verify connection by listing available tables

2. **Database Operations**
   - Use natural language to describe database operations
   - Example: "Create a new table for tracking driver locations with columns for driver_id, latitude, longitude, and timestamp"

3. **Query Optimization**
   - Analyze query performance
   - Implement suggested optimizations

4. **Schema Management**
   - Update database schema as needed
   - Create appropriate indexes for logistics data

### 5. Browser Tools MCP Usage

#### When to Use
- Debugging frontend issues in the LoadUp web applications
- Performance testing and optimization
- Accessibility testing
- Network request analysis

#### Process
1. **Capture Browser State**
   ```javascript
   mcp__takeScreenshot({ random_string: "any" })
   ```

2. **Analyze Console Logs**
   ```javascript
   mcp__getConsoleLogs({ random_string: "any" })
   ```

3. **Check Network Requests**
   ```javascript
   mcp__getNetworkLogs({ random_string: "any" })
   ```

4. **Run Performance Audits**
   ```javascript
   mcp__runPerformanceAudit({ random_string: "any" })
   ```

5. **Debug Issues**
   ```javascript
   mcp__runDebuggerMode({ random_string: "any" })
   ```

### 6. GitHub Integration MCP Usage

#### When to Use
- Repository management
- Code review and pull requests
- Issue tracking
- Deployment automation

#### Process
1. **Repository Management**
   ```javascript
   mcp__create_repository({
     name: "loadup-feature-name",
     description: "Feature implementation for LoadUp logistics",
     private: true,
     autoInit: true
   });
   ```

2. **Branch Management**
   ```javascript
   mcp__create_branch({
     owner: "your-username",
     repo: "loadup-logistics",
     branch: "feature/new-tracking-system"
   });
   ```

3. **Issue Management**
   ```javascript
   mcp__create_issue({
     owner: "your-username",
     repo: "loadup-logistics",
     title: "Implement real-time driver location tracking",
     body: "We need to add real-time location tracking for drivers using Mapbox integration",
     labels: ["enhancement", "tracking"]
   });
   ```

### 7. Task-Specific Workflows

#### New Feature Development
1. **Planning**
   - Use Sequential Thinking MCP to break down the feature
   - Create GitHub issues for tracking

2. **Database Schema**
   - Use Supabase MCP to design necessary database changes
   - Implement and test schema updates

3. **Backend Implementation**
   - Develop API endpoints
   - Implement business logic
   - Test with Supabase MCP

4. **Frontend Implementation**
   - Use 21st Magic Component Builder for UI components
   - Integrate with backend APIs
   - Test with Browser Tools MCP

5. **Testing & Deployment**
   - Run comprehensive tests
   - Create pull request using GitHub Integration MCP
   - Deploy and monitor

#### Bug Fixing
1. **Reproduction**
   - Use Browser Tools MCP to capture the issue
   - Analyze logs and network requests

2. **Root Cause Analysis**
   - Use Sequential Thinking MCP to identify potential causes
   - Test hypotheses

3. **Fix Implementation**
   - Implement the fix
   - Test thoroughly
   - Create pull request using GitHub Integration MCP

### 8. Best Practices

1. **Documentation**
   - Document all Sequential Thinking analyses
   - Keep records of generated components and their purposes
   - Document database schema changes

2. **Code Quality**
   - Review all generated code before integration
   - Ensure generated components follow LoadUp design guidelines
   - Optimize database queries for performance

3. **Collaboration**
   - Share Sequential Thinking analyses with team members
   - Use GitHub Integration for code reviews
   - Document decisions and rationales

4. **Security**
   - Never include sensitive information in MCP prompts
   - Review generated code for security issues
   - Follow secure database practices

### 9. Troubleshooting

1. **MCP Connection Issues**
   - Verify network connectivity
   - Check MCP server status
   - Restart MCP servers if necessary

2. **Generated Code Issues**
   - Review and modify generated code as needed
   - Test thoroughly before integration
   - Document common issues and solutions

3. **Database Connection Issues**
   - Verify connection string
   - Check database permissions
   - Test connection with simple queries

### 10. Continuous Improvement

1. **Regular Reviews**
   - Evaluate effectiveness of MCP tools
   - Identify areas for improvement
   - Update SOP as needed

2. **Feedback Collection**
   - Gather feedback from team members
   - Document successful use cases
   - Share best practices

3. **Tool Updates**
   - Keep MCP tools updated
   - Explore new MCP capabilities
   - Integrate new tools as appropriate

By following this SOP, we can maximize the benefits of MCP tools in our LoadUp development process, resulting in faster development cycles, higher code quality, and more efficient problem-solving. 