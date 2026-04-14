package com.moviesBooking.dto;

import java.util.List;

import lombok.Data;

@Data
public class PaymentIntentRequest
{
private Long showIds;
private List<Long> seatIds;
}
