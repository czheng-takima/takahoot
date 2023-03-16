import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatList } from '@angular/material/list';

@Component({
  selector: 'app-log-messages',
  templateUrl: './log-messages.component.html',
  styleUrls: ['./log-messages.component.scss']
})
export class LogMessagesComponent implements OnInit, AfterViewChecked {
  messages: string[] = [];
  @ViewChild('messageList') messageList!: MatList;
  addMessage(message: string) {
    this.messages.push(message);
  }

  ngOnInit(): void {
    // mock messages
    this.mockMessages();
  }

  ngAfterViewChecked(): void {
    this.scrollListToBottom();
  }

  /**
   * Does not work :(
   */
  private scrollListToBottom() {
    // const list = this.messageList.nativeElement;
    // list.scrollTop = list.scrollHeight;
  }

  mockMessages() {
    let counter = 1;
    setInterval(() => {
      this.addMessage(`Message ${counter++}`);
    }, 300);
  }
}
