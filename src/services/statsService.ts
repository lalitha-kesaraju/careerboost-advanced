import { collection, getDocs, query, where, getCountFromServer, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export interface DashboardStats {
  totalResumes: number;
  successful: number;
  failed: number;
  sessions: number;
  totalApplications: number;
}

export async function recordActivity(userId: string, type: 'resume' | 'interview' | 'application' | 'code' | 'login', title: string, description: string) {
  try {
    const logsRef = collection(db, `users/${userId}/logs`);
    await addDoc(logsRef, {
      type,
      title,
      description,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error recording activity:", error);
  }
}

export async function fetchUserStats(userId: string): Promise<DashboardStats> {
  try {
    const resumesRef = collection(db, `users/${userId}/resumes`);
    const applicationsRef = collection(db, `users/${userId}/applications`);
    const interviewsRef = collection(db, `users/${userId}/interviews`);

    const [resumesSnap, appsSnap, interviewsSnap, successSnap, failedSnap] = await Promise.all([
      getCountFromServer(resumesRef),
      getCountFromServer(applicationsRef),
      getCountFromServer(interviewsRef),
      getCountFromServer(query(applicationsRef, where('status', '==', 'offered'))),
      getCountFromServer(query(applicationsRef, where('status', '==', 'rejected')))
    ]);

    return {
      totalResumes: resumesSnap.data().count,
      successful: successSnap.data().count,
      failed: failedSnap.data().count,
      sessions: resumesSnap.data().count + appsSnap.data().count + interviewsSnap.data().count, // Sum of activities
      totalApplications: appsSnap.data().count
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalResumes: 0,
      successful: 0,
      failed: 0,
      sessions: 0,
      totalApplications: 0
    };
  }
}
