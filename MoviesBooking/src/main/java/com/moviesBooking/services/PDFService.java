package com.moviesBooking.services;

import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.moviesBooking.model.BookedSeat;
import com.moviesBooking.model.Booking;

@Service
public class PDFService 
{
  public byte[] generateReceipt(Booking booking)
  {
	  
	  try(ByteArrayOutputStream baos=new ByteArrayOutputStream())
	  {
	  PdfWriter writer=new PdfWriter(baos);
	  PdfDocument pdf = new PdfDocument(writer);
	  Document document = new Document(pdf);
	  Paragraph title = new Paragraph("Movie Ticket Booking Receipt")
			  .setTextAlignment(TextAlignment.CENTER)
			  .setFontSize(20);
	  document.add(title);
	  document.add(new Paragraph("\n"));
	  document.add(new Paragraph("Booking Reference: "+booking.getBookingReference()));
	  document.add(new Paragraph("Booking Date: "+booking.getBookingTime().format(DateTimeFormatter.ofPattern("dd-mm-yyyy HH:mm"))));
	  document.add(new Paragraph("\n"));
	  document.add(new Paragraph("movie: "+booking.getShow().getMovie().getTitle()));
	  document.add(new Paragraph("Theater: "+booking.getShow().getTheater().getName()));
	  document.add(new Paragraph("Screen: "+booking.getShow().getScreen().getName()));
	  document.add(new Paragraph("ShowTime: "+booking.getShow().getStartTime().format(DateTimeFormatter.ofPattern("dd-mm-yyyy HH:mm"))));
	  document.add(new Paragraph("\n"));
	  Table table = new Table(UnitValue.createPercentArray(new float[] {1,1,1}));
	  table.addHeaderCell("Seat Number");
	  table.addHeaderCell("Type");
	  table.addHeaderCell("Price");
	  for(BookedSeat bookedSeat:booking.getBookedSeats())
	  {
		  table.addCell(bookedSeat.getSeat().getSeatNumber());
		  table.addCell(bookedSeat.getSeat().getSeatType().toString());
		  table.addCell("$"+bookedSeat.getPrice());
	  }
	  document.add(table);
	  document.add(new Paragraph("\n"));
	  document.add(new Paragraph("Toatl Amount: $"+booking.getTotalAmount())
	  .setFontSize(14)
	  .setBold());
	  document.add(new Paragraph("\n"));
	  document.add(new Paragraph("Thank You For Booking with us")
	  .setTextAlignment(TextAlignment.CENTER)
	  .setItalic());
	  document.close();
	  return baos.toByteArray();
	  }
	  catch(Exception e)
	  {
		  throw new RuntimeException("Failed to Generate Receipt",e);
	  }
  } 
}
