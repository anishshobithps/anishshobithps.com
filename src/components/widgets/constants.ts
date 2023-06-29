export enum Branch {
    LEFT = "leftSide",
    RIGHT = "rightSide",
  }
  
  export enum NodeTypes {
    CONVERGE = "converge",
    DIVERGE = "diverge",
    CHECKPOINT = "checkpoint",
  }
  
  export enum ItemSize {
    SMALL = "small",
    LARGE = "large",
  }
  
  export const TIMELINE: Array<TimelineNodeV2> = [
    {
      type: NodeTypes.CHECKPOINT,
      title: "2022",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "Frontend Engineer 2 (Current)",
      size: ItemSize.SMALL,
      subtitle: "Frontend Engineering @ core team",
      // image: "/timeline/hotstar.svg",
      // slideImage: "/timeline/hotstar.jpeg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "2021",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "UI Engineer",
      size: ItemSize.SMALL,
      subtitle:
        "Contributed to Server driven UI framework for powering experiences @ Flipkart Wholesale 😎",
      // image: "/timeline/flipkart.svg",
      // slideImage: "/timeline/flipkart.gif",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "2020",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.DIVERGE,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "UI Engineer (freelance)",
      size: ItemSize.SMALL,
      subtitle:
        "Built solutions for employee engagement, productivity and performance 🎯",
      // image: "/timeline/huminos.svg",
      // slideImage: "/timeline/huminos-freelance.jpg",
      shouldDrawLine: true,
      alignment: Branch.RIGHT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "Motion Graphics (freelance)",
      size: ItemSize.SMALL,
      subtitle: "Motion Graphics content for Product Launch 🚀",
      // image: "/timeline/octanner.svg",
      // slideImage: "/timeline/aftereffects.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CONVERGE,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "2019",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "UI Engineer",
      size: ItemSize.SMALL,
      subtitle:
        "Worked on enterprise blockchain solutions for web. Transforming UI/UX and frontend framework. Built a design system.",
      // image: "/timeline/dltlabs.svg",
      // slideImage: "/timeline/dlt-website.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "UX Engineer",
      size: ItemSize.SMALL,
      subtitle:
        "First job! 🥳 Product design and development for employee engagement chatbot suite for workplace by facebook",
      // image: "/timeline/huminos.svg",
      // slideImage: "/timeline/huminos-website.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "Graduated from College 🎓",
      size: ItemSize.SMALL,
      subtitle:
        "Spent 4 years laying the foundation of Frontend Engineering, UI/UX, and Fitness!",
      // image: "/timeline/akgec.svg",
      // slideImage: "/timeline/farewell.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
  
    {
      type: NodeTypes.CHECKPOINT,
      title: "2018",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.DIVERGE,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "Student lead at SDC-SI",
      size: ItemSize.SMALL,
      subtitle:
        "Represented a team of 39 talented developers. Served different roles of leadership, project management and delivery.",
      // image: "/timeline/si.svg",
      // slideImage: "/timeline/si-head.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "Lecture on SVG animations",
      size: ItemSize.SMALL,
      subtitle:
        "Guided 200 students to create their first animated SVG using CSS/SMIL at PHP Workshop, SDC-SI",
  
      // slideImage: "/timeline/svg-lecture.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
  
    {
      type: NodeTypes.CHECKPOINT,
      title: "2017",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.RIGHT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "1st position in Web Designing, IMSU",
      size: ItemSize.SMALL,
      subtitle:
        "Competed against 20+ teams for design and development of web project from scratch",
      // slideImage: "/timeline/ims-17.jpg",
      shouldDrawLine: true,
      alignment: Branch.RIGHT,
    },
  
    {
      type: NodeTypes.CHECKPOINT,
      title: "Lecture on Javascript",
      size: ItemSize.SMALL,
      subtitle:
        "Guided 200 students for javascript fundamentals at Game Development workshop, SDC-SI",
      // slideImage: "/timeline/js-17.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
  
    {
      type: NodeTypes.CHECKPOINT,
      title: "1st position in Web Design, ABES ACM",
      size: ItemSize.SMALL,
      subtitle:
        "Competed in web and graphic design challenge with 100+ participants.",
      // slideImage: "/timeline/abes-17.jpg",
      shouldDrawLine: true,
      alignment: Branch.RIGHT,
    },
  
    {
      type: NodeTypes.CHECKPOINT,
      title: "Lecture on Web Technologies",
      size: ItemSize.SMALL,
      subtitle:
        "Guided 300+ students on getting started with web technologies like HTML/CSS and JS",
      // slideImage: "/timeline/web-17.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "2016",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.RIGHT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "1st position in Web Designing, IMSU",
      size: ItemSize.SMALL,
      subtitle: "Secured 1st prize in Web design challenge against 50+ teams",
      // slideImage: "/timeline/ims-16.jpg",
      shouldDrawLine: true,
      alignment: Branch.RIGHT,
    },
    {
      type: NodeTypes.CONVERGE,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "UI/UX, Frontend Engineer",
      size: ItemSize.SMALL,
      subtitle:
        "Started journey in SDC-SI, where I learnt the fundamentals of Frontend, UI/UX, Graphic design and more...",
      // image: "/timeline/si.svg",
      // slideImage: "/timeline/si-start.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "2014",
      size: ItemSize.LARGE,
      shouldDrawLine: false,
      alignment: Branch.LEFT,
    },
    {
      type: NodeTypes.CHECKPOINT,
      title: "Recognized Themer",
      size: ItemSize.SMALL,
      subtitle:
        "Awarded as recognized themer,  Developed themes and ROMs for Xperia 2011 devices lineup with over 15k+ downloads. Featured on xda portal twice.",
      // image: "/timeline/xda.svg",
      // slideImage: "/timeline/xda-rt.jpg",
      shouldDrawLine: true,
      alignment: Branch.LEFT,
    },
  ];
  
  export type TimelineNodeV2 = CheckpointNode | BranchNode;
  
  export interface CheckpointNode {
    type: NodeTypes.CHECKPOINT;
    title: string;
    subtitle?: string;
    size: ItemSize;
    // image?: string;
    // slideImage?: string;
    shouldDrawLine: boolean;
    alignment: Branch;
  }
  
  export interface BranchNode {
    type: NodeTypes.CONVERGE | NodeTypes.DIVERGE;
  }