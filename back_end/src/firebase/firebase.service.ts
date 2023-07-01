import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  FirebaseStorage,
  StorageReference,
  UploadMetadata,
  UploadResult,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

@Injectable()
export class FirebaseService {
  public app: FirebaseApp;
  public storage: FirebaseStorage;
  constructor(config: ConfigService) {
    this.app = initializeApp({
      apiKey: config.get<string>('FIREBASE_API_KEY'),
      authDomain: config.get<string>('FIREBASE_AUTH_DOMAIN'),
      projectId: config.get<string>('FIREBASE_PROJECT_ID'),
      storageBucket: config.get<string>('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: config.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
      appId: config.get<string>('FIREBASE_APP_ID'),
      measurementId: config.get<string>('FIREBASE_MEASUAREMENT_ID'),
    });

    this.storage = getStorage(this.app);
  }

  async FirebaseUpload(file: Express.Multer.File): Promise<string> {
    try {
      const storage: FirebaseStorage = getStorage();
      const fileName: string = `images/${Date.now()}_${file.originalname}`;
      const storeRef: StorageReference = ref(storage, fileName);

      const metadata: UploadMetadata = {
        contentType: file.mimetype,
      };

      const snapshot: UploadResult = await uploadBytes(
        storeRef,
        file.buffer,
        metadata,
      );

      const dowloandUrl: string = await getDownloadURL(snapshot.ref);

      return dowloandUrl;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
