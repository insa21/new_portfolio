import type { Experiment } from "@/types";

export const experiments: Experiment[] = [
  {
    id: "1",
    title: "AI Voice Clone",
    description: "Real-time voice cloning using deep learning. Trained custom TTS model on personal voice samples for realistic speech synthesis.",
    tags: ["Python", "TensorFlow", "TTS"],
    date: "Dec 2024",
    repoUrl: "https://github.com",
    demoUrl: "#",
  },
  {
    id: "2",
    title: "Gesture-Controlled UI",
    description: "Hand gesture recognition for controlling web interfaces. Uses MediaPipe for hand tracking and custom gesture classification.",
    tags: ["JavaScript", "MediaPipe", "WebRTC"],
    date: "Nov 2024",
    repoUrl: "https://github.com",
  },
  {
    id: "3",
    title: "LLM Code Reviewer",
    description: "Automated code review assistant using fine-tuned LLM. Analyzes PRs for bugs, security issues, and style improvements.",
    tags: ["Python", "LangChain", "GPT-4"],
    date: "Oct 2024",
    repoUrl: "https://github.com",
  },
  {
    id: "4",
    title: "Edge AI Object Detection",
    description: "Real-time object detection running on edge devices. Optimized YOLOv8 model for Raspberry Pi 4 with TensorRT.",
    tags: ["Python", "YOLO", "TensorRT"],
    date: "Sep 2024",
    repoUrl: "https://github.com",
  },
  {
    id: "5",
    title: "Generative Music AI",
    description: "Neural network that generates original music compositions. Trained on MIDI datasets with transformer architecture.",
    tags: ["Python", "PyTorch", "MIDI"],
    date: "Aug 2024",
    repoUrl: "https://github.com",
    demoUrl: "#",
  },
  {
    id: "6",
    title: "3D Scene Reconstruction",
    description: "Photogrammetry pipeline for creating 3D models from photos. Implements NeRF for novel view synthesis.",
    tags: ["Python", "NeRF", "Computer Vision"],
    date: "Jul 2024",
    repoUrl: "https://github.com",
  },
];
