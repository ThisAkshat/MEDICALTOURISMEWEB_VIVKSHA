import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  private API_KEY = 'AIzaSyD0x-yP-P_gu9r2wvyAWHrHy59lgaGZMcI';
  private BASE_URL = 'https://www.googleapis.com/youtube/v3';

  constructor(private http: HttpClient) {}

  getChannelVideos(): Observable<any> {
    const searchParams = new HttpParams()
      .set('part', 'snippet')
      .set('channelId', 'UCQ70v2Zyb1ZcHnE5hMgbV8A')
      .set('maxResults', '4')
      .set('order', 'date')
      .set('type', 'video')
      .set('key', this.API_KEY);
    //.set('videoDuration', 'medium'); //YouTube defines medium as: 4 minutes – 20 minutes

    return this.http.get<any>(`${this.BASE_URL}/search`, { params: searchParams }).pipe(
      switchMap((res) => {
        const videoIds = res.items.map((item: any) => item.id.videoId).join(',');

        const videoParams = new HttpParams()
          .set('part', 'contentDetails')
          .set('id', videoIds)
          .set('key', this.API_KEY);

        return this.http.get<any>(`${this.BASE_URL}/videos`, { params: videoParams }).pipe(
          switchMap((videoDetails) => {
            const filteredVideos = res.items.filter((item: any, index: number) => {
              const duration = videoDetails.items[index].contentDetails.duration;

              function isShort(duration: string) {
                const match = duration.match(/PT(\d+M)?(\d+S)?/);

                const minutes = match?.[1] ? parseInt(match[1]) : 0;
                const seconds = match?.[2] ? parseInt(match[2]) : 0;

                const totalSeconds = minutes * 60 + seconds;

                return totalSeconds < 60;
              }
              return !isShort(duration);
            });

            res.items = filteredVideos;
            return [res];
          }),
        );
      }),
    );
  }
}
