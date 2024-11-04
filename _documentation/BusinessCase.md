# Business Case

**Names:**
- Muhammad Zaman
- Maksim Sharoika
- Simran Brar

**Capstone Team Name:**  
Fleet

**Date:**  
October 14, 2024

## Proposed Project
**Project Name:**  
Fleet

**Date Produced:**  
October 14, 2024

## Background
The biggest problem in the ride-sharing market is the current monopoly that Uber has formed. A monopoly is not good for either the rider or driver as it lets Uber have 100% control over the prices. This leads to 3 key issues:

1. **Ethical**:  
   Uber controls prices; using an AI algorithm, it attempts to maximize prices to riders while minimizing payment to drivers. Thus, riders never know how much the drivers earn. It also uses this ambiguity to take an unknown cut of the drivers and riders' fares.

2. **Legal**:  
   A legal contractor in the USA and Canada must be able to set their rates. Uber does not allow that yet considers drivers contractors. They are currently in litigation in multiple states regarding this issue.

3. **Transparency**:  
   Uber hides its algorithm, leaving many drivers feeling confused about how rates work and why they might get a lower rate compared to other drivers. Uber also marks some of their rides as environmentally friendly for a higher rate but it doesn’t specify why or how this is a form of greenwashing.

## Business Need/Opportunity
Fleet will allow the driver to set their own rate while driving for longer or shorter distances. It will allow the driver to receive at least 95% of the fare while Fleet only keeps what it needs to facilitate the rides. Customers know they are getting a more ethical solution where the driver is making the majority of the fare price. Finally, customers will have the opportunity to request a desired driver, allowing them to create relationships for long-term service.

## Options
**Option 1:**  
Create a ride-sharing mobile application that can be on both iOS and Android. We would use the MERN-M tech stack in accordance with REST standards due to its features and the experience our team has with the stack. This will be a mobile application built using monolithic architecture; React Native allows for both iOS and Android compatibility.

**Option 2:**  
Create a ride-sharing mobile application that can be on both iOS and Android. We would use the MERN-M tech stack in accordance with REST standards due to its features and the experience our team has with the stack. This will be a mobile application built using microservices architecture; React Native allows for both iOS and Android compatibility.

## Cost-Benefit Analysis

### **Option 1: Monolithic Architecture**

**Overview:**  
Developing a ride-sharing mobile application using the **MERN-M stack with monolithic architecture** will enable faster development and deployment. This architecture allows for a unified codebase, making the development process simpler and more manageable for smaller teams. The key advantage is **lower upfront costs** and quicker time to market, though scalability could become a challenge in the long term.

#### **Benefits:**
- **Faster Development:** Single codebase makes development more efficient, especially for smaller teams.
- **Lower Initial Costs:** Simple infrastructure and deployment, with reduced hosting expenses.
- **Quick Time to Market:** Allows faster testing and feedback, which is critical in a competitive market.
- **Simplified Maintenance Early On:** Easier to manage updates and fixes in the early stages of the app.

#### **Drawbacks:**
- **Limited Scalability:** Vertical scaling (increasing server power) is required, which can become costly and inefficient.
- **Increased Maintenance Complexity:** As the application grows, maintaining a monolithic codebase becomes more difficult.
- **Downtime Risk:** Any bug or failure can bring down the entire system.
- **Technical Debt:** Over time, the monolithic architecture may require re-architecture as user demand grows.

### **Option 2: Microservices Architecture**

**Overview:**  
Developing a ride-sharing mobile application using the **MERN-M stack with microservices architecture** allows for better scalability and resilience. Each microservice is developed and deployed independently, making it easier to manage and scale the application. However, it comes with a higher upfront cost and operational complexity.

#### **Benefits:**
- **High Scalability:** Each service can scale independently, making it more cost-efficient and flexible in the long run.
- **Resilience:** Failures in one service do not affect the entire system, improving uptime and fault tolerance.
- **Team Autonomy:** Independent services allow teams to develop, test, and deploy new features faster once the architecture is set up.
- **Future-Proofing:** Easier to add new services or features without impacting the rest of the system.

#### **Drawbacks:**
- **Higher Initial Costs:** Requires more advanced infrastructure (e.g., Docker, Kubernetes) and specialized tools for orchestration.
- **Longer Development Time:** More time is needed to set up the architecture and handle service communication, making it slower to bring to market.
- **Increased Complexity:** Managing multiple services requires more complex operational processes, such as inter-service communication, debugging, and security.
- **Operational Overhead:** Monitoring, logging, and securing each service independently adds additional costs and complexity.

## Recommendation

We recommend proceeding with **Option 1 (Monolithic Architecture)** for the initial development phase, focusing on delivering a functional and scalable **Minimum Viable Product (MVP)** quickly. This approach aligns with the following timeline:

### **MVP 1: Backend Development with Skeleton Frontend**
- **Target Completion Date:** End of January
- **Focus:** Build a working backend with core ride-sharing features and a basic frontend interface. The monolithic architecture will allow faster development and integration, ensuring the application’s core functionalities are solid.
  
### **MVP 2: Completed Frontend with User Testing**
- **Target Completion Date:** End of February
- **Focus:** Complete the frontend design and conduct user testing. React Native will allow for compatibility across both iOS and Android platforms, and the monolithic structure will simplify changes based on user feedback. Once MVP 2 is finished, the app will be ready for submission to the App Store and Google Play.

### **MVP 3: Public Launch**
- **Target Completion Date:** March
- **Focus:** Finalize the application for public release on both iOS and Android stores. With the monolithic architecture, deployment and final bug fixes will be more straightforward, ensuring a smooth release.

**Why Monolithic Architecture for MVP?**
- **Quicker Time to Market:** Monolithic architecture provides the speed needed to complete MVP 1 and MVP 2 by the target dates.
- **Lower Upfront Costs:** Lower infrastructure complexity in the early phases, keeping the focus on delivering a working product without overcomplicating the architecture.
- **Simplicity in Early Development:** A unified codebase will allow easier debugging, integration, and testing as we move from MVP 1 to MVP 3.

Once the application gains traction and requires further scalability, we can consider transitioning to a **microservices architecture** in the future. This will allow the app to handle higher traffic and more complex functionalities as the user base grows.

