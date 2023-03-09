import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-log-messages',
  templateUrl: './log-messages.component.html',
  styleUrls: ['./log-messages.component.scss']
})
export class LogMessagesComponent implements OnInit {
  messages: string[] = [];

  addMessage(message: string) {
    this.messages.push(message);
  }

  ngOnInit(): void {
    // mock messages
    this.addMessage('Message 1');
    this.addMessage('Message 2');
    this.addMessage('Message 3');
    this.addMessage('Message 1');
    this.addMessage('Message 2');
    this.addMessage('Message 3');
    this.addMessage('Message 1');
    this.addMessage('Message 2');
    this.addMessage('Message 3');
    this.addMessage('Message 1');
    this.addMessage('Message 2');
    this.addMessage('Message 3');
    this.addMessage('Message 1');
    this.addMessage('Message 2');
    this.addMessage('Message 3');
    this.addMessage('Message 1');
    this.addMessage('Message 2');
    this.addMessage('Message 3');
  }
}
