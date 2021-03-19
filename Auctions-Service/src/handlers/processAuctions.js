import { closeAuction } from '../lib/closeAuction';
import { getEndedAuctions } from '../lib/getEndingAuctions';
import createError from 'http-errors';

// this is not a http method -- so not wrapping it with middy -- at least for now
async function processAuctions() {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    ); // this map function will return array of promises
    await Promise.all(closePromises);

    return { close: closePromises.length }; // this is not http method - so we can return anything in any way
  } catch (error) {
    console.error('Error coming from processing auctions: ', error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processAuctions;
