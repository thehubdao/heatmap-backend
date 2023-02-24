import { config } from 'dotenv'
import * as admin from 'firebase-admin'
import { GlobalStats } from '../types/firebase'
import { Metaverse } from '../types/metaverse'

config()

var serviceAccount:any = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": `${process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, "\n")}`,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
  }

const firebaseInstance = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

const firestore = firebaseInstance.firestore()

const statsCollection = firestore.collection('stats')

const createGlobalStats = async (metaverse: Metaverse) => {
    const statsDoc = statsCollection.doc(metaverse)
    const globalStats: GlobalStats = {
        current_month_calls: 0,
        average: 0,
        median: 0,
        history: {}
    }

    statsDoc.set(globalStats)

    return statsDoc
}

const updateStats = async (metaverse: Metaverse) => {
    const currentDate = new Date(Date.now())
    const currentMonth = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
    const statsDoc = await getStats(metaverse)

    await statsDoc.update({ [`history.${currentMonth}.month_calls`]: admin.firestore.FieldValue.increment(1) })

    const statsData = (await statsDoc.get()).data()
    const monthData: number[] = Object.values(statsData!.history)
    const monthsCalls = monthData.map((month: any) => month.month_calls)
    const statsGlobalData: any = calculateStats(monthsCalls)
    statsGlobalData.current_month_calls = statsData!.history[currentMonth].month_calls

    await statsDoc.update(statsGlobalData)

}

const getStats = async (metaverse: Metaverse) => {
    const statsDoc = statsCollection.doc(metaverse)
    const statsData = await statsDoc.get()
    const stats = statsData.data()

    if (!stats) await createGlobalStats(metaverse)

    return statsDoc

}

const calculateStats = (values: number[]) => {
    values.sort(function (a, b) { return a - b });
    let avg = 0;
    for (let value of values)
        avg += value / values.length;
    let mid = Math.floor(values.length / 2.0);
    return {
        average: avg,
        median: (values.length % 2 == 0) ? (values[mid] + values[mid - 1]) / 2.0 : values[mid]
    };
}

export {updateStats}